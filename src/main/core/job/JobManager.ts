import { application } from '@application'
import type { InsertJobRow, JobRow } from '@data/db/schemas/job'
import { jobScheduleService } from '@data/services/JobScheduleService'
import { jobService } from '@data/services/JobService'
import { loggerService } from '@logger'
import { Application } from '@main/core/application/Application'
import { BaseService, DependsOn, Injectable, Phase, ServicePhase } from '@main/core/lifecycle'
import type { Disposable } from '@main/core/lifecycle/event'
import {
  JOB_ERROR_CODES,
  type JobError,
  type JobScheduleSnapshot,
  type JobSnapshot,
  type RetryPolicy,
  type Trigger
} from '@shared/data/api/schemas/jobs'
import { Mutex } from 'async-mutex'

import type { JobPayloadOf, JobType } from './jobRegistry'
import { computeCatchUpAction } from './runtime/catchUp'
import { DispatchQueue } from './runtime/DispatchQueue'
import { runStartupRecovery } from './runtime/recovery'
import {
  type EnqueueOptions,
  JOB_PROGRESS_KEY_PREFIX,
  JOB_STATE_KEY_PREFIX,
  type JobContext,
  type JobHandle,
  type JobHandler,
  type JobScheduleRegistrationInput
} from './types'

const logger = loggerService.withContext('JobManager')

/** Default retry policy used when handler does not declare one. */
const DEFAULT_RETRY_POLICY: RetryPolicy = {
  maxAttempts: 3,
  backoff: 'exponential',
  baseDelayMs: 1000,
  maxDelayMs: 60_000
}

const MAX_INPUT_BYTES = 1_048_576 // 1MB
const MAX_CANCEL_REASON_CHARS = 500

const DEFAULT_GLOBAL_MAX_CONCURRENCY = 50
const GC_INTERVAL_MS = 60 * 60 * 1000 // 1h
const GC_TERMINAL_TTL_MS = 7 * 24 * 60 * 60 * 1000 // 7 days
const GC_KEEP_PER_TYPE = 100
const DELAYED_PROMOTION_INTERVAL_MS = 5 * 60 * 1000 // 5min

interface FinishedResolver {
  resolve: (snapshot: JobSnapshot) => void
  promise: Promise<JobSnapshot>
}

/**
 * Job orchestration: registers handlers, persists job rows, runs DB-driven
 * dispatch with Layer 0 + Layer 1 mutex, executes handler callbacks, manages
 * 6-state state machine, schedule registry, retry backoff, startup recovery,
 * catch-up detection, GC.
 *
 * Phase 1 boundaries (see plan):
 *   - GC hardcoded (1h sweep + 100 per type + 7-day TTL)
 *   - globalMaxConcurrency = 50 (constructor default, not configurable)
 *   - No worker / child_process executor
 *   - No DAG / DLQ / priority preemption
 */
@Injectable('JobManager')
@ServicePhase(Phase.WhenReady)
@DependsOn(['DbService', 'CacheService', 'SchedulerService'])
export class JobManager extends BaseService {
  private readonly handlers = new Map<string, JobHandler>()
  private readonly queues = new Map<string, DispatchQueue>()
  private readonly globalDispatchMutex = new Mutex()
  private readonly abortControllers = new Map<string, AbortController>()
  private readonly finishedResolvers = new Map<string, FinishedResolver>()
  private readonly scheduleDisposables = new Map<string, Disposable>()
  private readonly globalMaxConcurrency = DEFAULT_GLOBAL_MAX_CONCURRENCY

  // ---------------- Lifecycle ----------------

  protected override onInit(): void {
    logger.info('JobManager initialized')
  }

  protected override async onReady(): Promise<void> {
    const stats = await runStartupRecovery(this.handlers)
    logger.info('Startup recovery complete', stats)

    // Arm all enabled schedules so SchedulerService can fire them.
    const schedules = await jobScheduleService.listEnabled()
    for (const schedule of schedules) {
      this.armSchedule(schedule)
    }

    await this.detectAndDispatchOverdue(schedules)

    // GC + delayed-promotion ticks. registerInterval auto-unrefs + clears on stop.
    this.registerInterval(() => void this.runGC(), GC_INTERVAL_MS)
    this.registerInterval(async () => {
      const promoted = await jobService.promoteDelayedDue(Date.now())
      if (promoted > 0) {
        logger.debug('Promoted delayed jobs', { count: promoted })
        this.dispatchAll()
      }
    }, DELAYED_PROMOTION_INTERVAL_MS)

    // Kick the queues once — any job reset by recovery should start now.
    this.dispatchAll()
    logger.info('JobManager ready', { schedules: schedules.length })
  }

  protected override async onStop(): Promise<void> {
    const inFlight = Array.from(this.abortControllers.keys())
    for (const controller of this.abortControllers.values()) {
      controller.abort(new Error('JobManager shutdown'))
    }
    for (const disposable of this.scheduleDisposables.values()) {
      disposable.dispose()
    }
    this.scheduleDisposables.clear()

    if (inFlight.length === 0) {
      logger.info('JobManager.onStop: no in-flight jobs')
    } else {
      const pendingPromises = inFlight
        .map((id) => this.finishedResolvers.get(id)?.promise)
        .filter((p): p is Promise<JobSnapshot> => p !== undefined)

      const timeout = new Promise<'timeout'>((resolve) =>
        setTimeout(() => resolve('timeout'), Application.SHUTDOWN_TIMEOUT_MS)
      )
      const winner = await Promise.race([Promise.allSettled(pendingPromises).then(() => 'done' as const), timeout])

      if (winner === 'timeout') {
        logger.warn('JobManager.onStop timed out — pending jobs will be recovered on next start', {
          inFlight: inFlight.length,
          timeoutMs: Application.SHUTDOWN_TIMEOUT_MS
        })
      } else {
        logger.info('JobManager.onStop: all in-flight jobs settled')
      }
    }

    // Critical anti-leak: discard unresolved finished resolvers without
    // rejecting their promises. Callers awaiting them keep an unsettled
    // Promise — their responsibility to wrap in a timeout / race.
    this.finishedResolvers.clear()
    this.abortControllers.clear()
  }

  protected override onDestroy(): void {
    this.handlers.clear()
    this.queues.clear()
    this.abortControllers.clear()
    this.finishedResolvers.clear()
    this.scheduleDisposables.clear()
  }

  // ---------------- Handler registry ----------------

  registerHandler<K extends JobType>(type: K, handler: JobHandler<JobPayloadOf<K>>): void {
    if (this.handlers.has(type)) {
      throw new Error(`JobManager: handler for type "${type}" is already registered`)
    }
    this.handlers.set(type, handler as JobHandler)
    logger.info('Handler registered', { type, recovery: handler.recovery })
  }

  hasHandler(type: string): boolean {
    return this.handlers.has(type)
  }

  // ---------------- enqueue / cancel / list / get ----------------

  async enqueue<K extends JobType>(type: K, input: JobPayloadOf<K>, opts: EnqueueOptions = {}): Promise<JobHandle> {
    const handler = this.handlers.get(type)
    if (!handler) {
      throw this.makeError(JOB_ERROR_CODES.UNKNOWN_TYPE, `No handler registered for type "${type}"`, {
        type,
        knownTypes: Array.from(this.handlers.keys())
      })
    }

    const inputJson = JSON.stringify(input ?? null)
    if (inputJson.length > MAX_INPUT_BYTES) {
      throw this.makeError(JOB_ERROR_CODES.PAYLOAD_TOO_LARGE, 'Job input payload exceeds 1MB', {
        type,
        sizeBytes: inputJson.length
      })
    }

    if (opts.idempotencyKey) {
      const existing = await jobService.findActiveByIdempotencyKey(opts.idempotencyKey)
      if (existing) {
        logger.info('idempotencyKey match — returning existing handle', {
          type,
          key: opts.idempotencyKey,
          existingId: existing.id
        })
        return this.handleFor(existing)
      }
    }

    const queueName = opts.queue ?? handler.defaultQueue?.(input as never) ?? type
    const concurrency = handler.defaultConcurrency ?? 1
    this.ensureQueue(queueName, concurrency)

    const now = Date.now()
    const scheduledAt = opts.scheduledAt ?? now
    const status = scheduledAt > now ? 'delayed' : 'pending'
    const maxAttempts = opts.maxAttempts ?? handler.defaultRetryPolicy?.maxAttempts ?? DEFAULT_RETRY_POLICY.maxAttempts

    const insertRow: InsertJobRow = {
      type,
      status,
      priority: opts.priority ?? 0,
      queue: queueName,
      idempotencyKey: opts.idempotencyKey ?? null,
      scheduleId: opts.scheduleId ?? null,
      scheduledAt,
      attempt: 0,
      maxAttempts,
      input: inputJson,
      parentId: opts.parentId ?? null,
      cancelRequested: false,
      metadata: JSON.stringify(opts.metadata ?? {}),
      timeoutMs: opts.timeoutMs ?? handler.defaultTimeoutMs ?? null
    }

    const snapshot = await jobService.create(insertRow)
    this.publishState(snapshot)
    const handle = this.handleFor(snapshot)

    if (snapshot.status === 'pending') {
      void this.dispatch(queueName)
    } else if (snapshot.status === 'delayed') {
      this.armDelayedJob(snapshot)
    }

    logger.info('Job enqueued', {
      id: snapshot.id,
      type,
      queue: queueName,
      status: snapshot.status,
      scheduledAt
    })
    return handle
  }

  async cancel(jobId: string, reason?: string): Promise<void> {
    if (reason !== undefined && reason.length > MAX_CANCEL_REASON_CHARS) {
      throw this.makeError(JOB_ERROR_CODES.CANCEL_REASON_TOO_LONG, 'Cancel reason exceeds 500 characters', {
        length: reason.length
      })
    }

    const db = application.get('DbService').getDb()
    await db.transaction(async (tx) => {
      await jobService.setCancelRequestedTx(tx, jobId)
    })

    const controller = this.abortControllers.get(jobId)
    if (controller) {
      controller.abort(new Error(`Job cancelled${reason ? `: ${reason}` : ''}`))
      // Wait up to handler.cancelTimeoutMs (default 30s) for the handler to
      // acknowledge. If the timeout fires the handler is misbehaving — force
      // the job into 'cancelled' so the dispatch queue slot frees up.
      const snapshot = await jobService.getById(jobId)
      const handler = snapshot ? this.handlers.get(snapshot.type) : undefined
      const graceMs = handler?.cancelTimeoutMs ?? 30_000
      const finished = this.finishedResolvers.get(jobId)?.promise
      if (finished) {
        const timeout = new Promise<'timeout'>((resolve) => setTimeout(() => resolve('timeout'), graceMs))
        const winner = await Promise.race([finished.then(() => 'done' as const), timeout])
        if (winner === 'timeout') {
          logger.warn('cancel timed out — forcing terminal state', { jobId, graceMs })
          await this.finalizeJob(jobId, 'cancelled', undefined, {
            code: JOB_ERROR_CODES.CANCELLED,
            message: `Cancel timed out after ${graceMs}ms${reason ? ` (reason: ${reason})` : ''}`,
            retryable: false
          })
        }
      }
    } else {
      // Not in-flight — pending / delayed → finalize directly as cancelled
      const snapshot = await jobService.getById(jobId)
      if (snapshot && (snapshot.status === 'pending' || snapshot.status === 'delayed')) {
        await this.finalizeJob(jobId, 'cancelled', undefined, {
          code: JOB_ERROR_CODES.CANCELLED,
          message: reason ?? 'Cancelled by user',
          retryable: false
        })
      }
    }
  }

  /**
   * Cancel all non-terminal jobs matching the filter. Aborts in-flight
   * AbortControllers in this process and transitions pending/delayed rows
   * directly to 'cancelled'. Covers reset() semantics for Phase 4 Knowledge
   * reset and Phase 3 FileProcessing batch cancellation.
   *
   * Empty filter (no queue and no type) is rejected — preventing accidental
   * "cancel all jobs in the system".
   *
   * Returns:
   *   - `aborted`: in-flight controllers aborted in this process
   *   - `transitioned`: pending/delayed rows finalized synchronously
   *
   * Running jobs settle asynchronously through the normal handler-execute
   * flow (handler observes signal.aborted) and are NOT counted as transitioned.
   */
  async cancelMany(
    filter: { queue?: string; type?: string },
    reason?: string
  ): Promise<{ aborted: number; transitioned: number }> {
    if (!filter.queue && !filter.type) {
      throw new Error('cancelMany: filter must specify queue or type (empty filter rejected)')
    }
    if (reason !== undefined && reason.length > MAX_CANCEL_REASON_CHARS) {
      throw this.makeError(JOB_ERROR_CODES.CANCEL_REASON_TOO_LONG, 'Cancel reason exceeds 500 characters', {
        length: reason.length
      })
    }
    const db = application.get('DbService').getDb()
    const result = await db.transaction(async (tx) =>
      jobService.cancelManyTx(tx, filter, {
        code: JOB_ERROR_CODES.CANCELLED,
        message: reason ?? 'Cancelled by cancelMany',
        retryable: false
      })
    )
    let aborted = 0
    for (const id of result.runningIds) {
      const controller = this.abortControllers.get(id)
      if (controller) {
        controller.abort(new Error(`Job cancelled${reason ? `: ${reason}` : ''}`))
        aborted++
      }
    }
    return { aborted, transitioned: result.transitioned }
  }

  async get(jobId: string): Promise<JobSnapshot | null> {
    return jobService.getById(jobId)
  }

  async list(filter: Parameters<typeof jobService.list>[0] = {}): Promise<JobSnapshot[]> {
    return jobService.list(filter)
  }

  // ---------------- Schedule registry (dual API: type+name / by id) ----------------

  async registerJobSchedule<K extends JobType>(input: JobScheduleRegistrationInput<K>): Promise<{ id: string }> {
    if (!this.handlers.has(input.type)) {
      throw this.makeError(JOB_ERROR_CODES.UNKNOWN_TYPE, `No handler for schedule type "${input.type}"`, {
        type: input.type
      })
    }
    const snapshot = await jobScheduleService.create({
      type: input.type,
      name: input.name ?? null,
      trigger: input.trigger,
      jobInputTemplate: input.jobInputTemplate,
      catchUpPolicy: input.catchUpPolicy,
      metadata: input.metadata,
      enabled: input.enabled
    })
    this.armSchedule(snapshot)
    logger.info('Schedule registered', { id: snapshot.id, type: input.type, name: snapshot.name })
    return { id: snapshot.id }
  }

  async pauseJobScheduleById(id: string): Promise<boolean> {
    const disp = this.scheduleDisposables.get(id)
    if (disp) {
      disp.dispose()
      this.scheduleDisposables.delete(id)
    }
    return jobScheduleService.setEnabled(id, false)
  }

  async resumeJobScheduleById(id: string): Promise<boolean> {
    const updated = await jobScheduleService.setEnabled(id, true)
    if (updated) {
      const snapshot = await jobScheduleService.getById(id)
      if (snapshot) this.armSchedule(snapshot)
    }
    return updated
  }

  async triggerJobScheduleNowById(id: string): Promise<boolean> {
    const schedule = await jobScheduleService.getById(id)
    if (!schedule) return false
    // Try Scheduler's native trigger first (works for cron triggers).
    const triggered = await application.get('SchedulerService').triggerNow(`schedule:${id}`)
    if (triggered) return true
    // For interval/once schedules, enqueue directly using the schedule's template.
    await this.enqueue(schedule.type as JobType, schedule.jobInputTemplate as never, {
      scheduleId: schedule.id
    })
    return true
  }

  async unregisterJobScheduleById(id: string): Promise<boolean> {
    const disp = this.scheduleDisposables.get(id)
    if (disp) {
      disp.dispose()
      this.scheduleDisposables.delete(id)
    }
    return jobScheduleService.delete(id)
  }

  async getJobScheduleById(id: string): Promise<JobScheduleSnapshot | null> {
    return jobScheduleService.getById(id)
  }

  async listJobSchedules(
    filter: Parameters<typeof jobScheduleService.listAll>[0] = {}
  ): Promise<JobScheduleSnapshot[]> {
    return jobScheduleService.listAll(filter)
  }

  // By-name flavor — internal resolves to by-id.

  async pauseJobSchedule<K extends JobType>(type: K, name?: string | null): Promise<boolean> {
    const id = await this.resolveScheduleIdByName(type, name)
    return this.pauseJobScheduleById(id)
  }

  async resumeJobSchedule<K extends JobType>(type: K, name?: string | null): Promise<boolean> {
    const id = await this.resolveScheduleIdByName(type, name)
    return this.resumeJobScheduleById(id)
  }

  async triggerJobScheduleNow<K extends JobType>(type: K, name?: string | null): Promise<boolean> {
    const id = await this.resolveScheduleIdByName(type, name)
    return this.triggerJobScheduleNowById(id)
  }

  async unregisterJobSchedule<K extends JobType>(type: K, name?: string | null): Promise<boolean> {
    const id = await this.resolveScheduleIdByName(type, name)
    return this.unregisterJobScheduleById(id)
  }

  async getJobSchedule<K extends JobType>(type: K, name?: string | null): Promise<JobScheduleSnapshot | null> {
    const id = await this.resolveScheduleIdByName(type, name).catch((err) => {
      // For "name required" errors, surface them. For "not found", return null.
      if (err instanceof Error && err.message.includes(JOB_ERROR_CODES.SCHEDULE_NOT_FOUND_BY_NAME)) return null
      throw err
    })
    if (typeof id !== 'string') return null
    return jobScheduleService.getById(id)
  }

  private async resolveScheduleIdByName(type: string, name?: string | null): Promise<string> {
    if (name == null) {
      const candidates = await jobScheduleService.listAll({ type })
      if (candidates.length > 1) {
        throw this.makeError(
          JOB_ERROR_CODES.SCHEDULE_NAME_REQUIRED,
          `Type "${type}" has multiple schedules — name required`,
          { type, knownNames: candidates.map((c) => c.name) }
        )
      }
      if (candidates.length === 1) return candidates[0].id
    }
    const snapshot = await jobScheduleService.getByTypeAndName(type, name)
    if (!snapshot) {
      const knownNames = await jobScheduleService.listNamesForType(type)
      throw this.makeError(JOB_ERROR_CODES.SCHEDULE_NOT_FOUND_BY_NAME, `Schedule not found for type "${type}"`, {
        type,
        name: name ?? null,
        knownNames
      })
    }
    return snapshot.id
  }

  // ---------------- Dispatch + execute ----------------

  /**
   * Get or create a DispatchQueue.
   *
   * Concurrency is set at first creation and NOT updated on subsequent calls
   * with the same queueName. If the same queueName is reached via different
   * handlers with different `defaultConcurrency`, the first enqueue wins.
   * Phase 1 follows the plan convention "one type ↔ one queue ↔ one
   * concurrency", so this is unobservable in practice. Documented for the
   * future-proof reader.
   */
  private ensureQueue(name: string, concurrency: number): DispatchQueue {
    let queue = this.queues.get(name)
    if (!queue) {
      queue = new DispatchQueue(name, concurrency)
      this.queues.set(name, queue)
    }
    return queue
  }

  /**
   * Try to claim one pending job in `queueName` and spawn its handler. Releases
   * both mutex layers before invoking the handler. Schedules a microtask
   * recursion to fill the next slot if one was claimed.
   */
  async dispatch(queueName: string): Promise<void> {
    const queue = this.queues.get(queueName)
    if (!queue) return

    const releaseQueue = await queue.mutex.acquire()
    const releaseGlobal = await this.globalDispatchMutex.acquire()
    let claimed: JobRow | null = null

    try {
      const db = application.get('DbService').getDb()
      claimed = await db.transaction(async (tx) => {
        const queueActive = await jobService.countActiveByQueueTx(tx, queueName)
        if (queueActive >= queue.concurrency) return null
        const globalActive = await jobService.countActiveGlobalTx(tx)
        if (globalActive >= this.globalMaxConcurrency) return null
        return jobService.claimNextPendingTx(tx, queueName)
      })
    } catch (err) {
      logger.error('dispatch transaction failed', { queue: queueName, error: err })
    } finally {
      releaseGlobal()
      releaseQueue()
    }

    if (!claimed) return

    // Spawn handler outside of the mutex.
    this.spawnExecute(claimed)
    queueMicrotask(() => void this.dispatch(queueName))
  }

  private dispatchAll(): void {
    for (const name of this.queues.keys()) {
      void this.dispatch(name)
    }
  }

  /**
   * Build context, spawn handler.execute, transition state on terminal or
   * schedule retry on retryable failure. Errors thrown synchronously by
   * handler before its first await are caught inside the same task.
   */
  private spawnExecute(row: JobRow): void {
    const handler = this.handlers.get(row.type)
    if (!handler) {
      logger.error('spawnExecute: missing handler — finalizing as failed', { type: row.type, id: row.id })
      void this.finalizeJob(row.id, 'failed', undefined, {
        code: JOB_ERROR_CODES.UNKNOWN_TYPE,
        message: `No handler registered for type "${row.type}"`,
        retryable: false
      })
      return
    }

    const controller = new AbortController()
    this.abortControllers.set(row.id, controller)

    let timeoutHandle: ReturnType<typeof setTimeout> | undefined
    if (row.timeoutMs && row.timeoutMs > 0) {
      timeoutHandle = setTimeout(() => {
        controller.abort(new Error('JobHandlerTimeout'))
      }, row.timeoutMs)
      timeoutHandle.unref?.()
    }

    const ctx: JobContext = {
      jobId: row.id,
      input: this.parseJson(row.input, undefined),
      attempt: row.attempt,
      signal: controller.signal,
      metadata: (this.parseJson(row.metadata, {}) ?? {}) as Record<string, unknown>,
      patchMetadata: async (patch) => {
        const current = (this.parseJson(row.metadata, {}) ?? {}) as Record<string, unknown>
        const merged = { ...current, ...patch }
        row.metadata = JSON.stringify(merged)
        const db = application.get('DbService').getDb()
        await db.transaction(async (tx) => {
          await jobService.setMetadataTx(tx, row.id, row.metadata)
        })
      },
      reportProgress: (progress, detail) => {
        application.get('CacheService').setShared(`${JOB_PROGRESS_KEY_PREFIX}${row.id}`, { progress, detail }, 60_000)
      },
      logger: loggerService.withContext('JobExec', { jobId: row.id, type: row.type })
    }

    void (async () => {
      try {
        const output = await handler.execute(ctx)
        if (timeoutHandle) clearTimeout(timeoutHandle)
        await this.finalizeJob(row.id, 'completed', output, null)
      } catch (err) {
        if (timeoutHandle) clearTimeout(timeoutHandle)
        const isAbort = this.isAbortError(err)
        const error: JobError = isAbort
          ? {
              code: JOB_ERROR_CODES.CANCELLED,
              message: (err as Error).message || 'Cancelled',
              retryable: false
            }
          : {
              code: this.isTimeoutError(err) ? JOB_ERROR_CODES.HANDLER_TIMEOUT : JOB_ERROR_CODES.HANDLER_THREW,
              message: (err as Error).message || String(err),
              retryable: true
            }

        const retryPolicy = handler.defaultRetryPolicy ?? DEFAULT_RETRY_POLICY
        const canRetry = !isAbort && error.retryable && row.attempt + 1 < row.maxAttempts

        if (canRetry) {
          const backoffMs = this.computeBackoff(retryPolicy, row.attempt + 1)
          const scheduledAt = Date.now() + backoffMs
          await this.scheduleRetry(row.id, row.attempt + 1, scheduledAt, error, row.queue)
        } else {
          await this.finalizeJob(row.id, isAbort ? 'cancelled' : 'failed', undefined, error)
        }
      } finally {
        this.abortControllers.delete(row.id)
      }
    })()
  }

  private async finalizeJob(
    jobId: string,
    status: 'completed' | 'failed' | 'cancelled',
    output: unknown | undefined,
    error: JobError | null
  ): Promise<void> {
    const db = application.get('DbService').getDb()
    try {
      await db.transaction(async (tx) => {
        await jobService.setTerminalTx(tx, jobId, status, output, error)
      })
    } catch (err) {
      logger.error('finalizeJob: tx failed — job may stay running until next recovery', { jobId, status, err })
      return
    }

    const snapshot = await jobService.getById(jobId)
    if (!snapshot) return

    this.publishState(snapshot)

    const resolver = this.finishedResolvers.get(jobId)
    if (resolver) {
      resolver.resolve(snapshot)
      this.finishedResolvers.delete(jobId)
    }

    const handler = this.handlers.get(snapshot.type)
    if (handler?.onSettled) {
      try {
        await handler.onSettled({
          jobId,
          type: snapshot.type,
          scheduleId: snapshot.scheduleId,
          status,
          output: snapshot.output,
          error: snapshot.error,
          attempt: snapshot.attempt
        })
      } catch (settledErr) {
        logger.warn('handler.onSettled threw — ignoring', {
          jobId,
          err: (settledErr as Error).message
        })
      }
    }

    // A slot just freed — dispatch in case another job is waiting.
    void this.dispatch(snapshot.queue)
  }

  private async scheduleRetry(
    jobId: string,
    nextAttempt: number,
    scheduledAt: number,
    error: JobError,
    queue: string
  ): Promise<void> {
    const db = application.get('DbService').getDb()
    await db.transaction(async (tx) => {
      await jobService.setDelayedRetryTx(tx, jobId, nextAttempt, scheduledAt, error)
    })

    const scheduler = application.get('SchedulerService')
    const retryId = `retry:${jobId}:${nextAttempt}`
    scheduler.registerSchedule(retryId, { kind: 'once', at: scheduledAt }, async () => {
      await jobService.promoteDelayedDue(Date.now())
      void this.dispatch(queue)
    })
    logger.info('Retry scheduled', { jobId, nextAttempt, scheduledAt, queue })
  }

  // ---------------- Schedule arming + catch-up ----------------

  private armSchedule(schedule: JobScheduleSnapshot): void {
    if (!schedule.enabled) return
    if (this.scheduleDisposables.has(schedule.id)) {
      // Replace existing disposable (e.g. on edit / re-enable)
      this.scheduleDisposables.get(schedule.id)?.dispose()
      this.scheduleDisposables.delete(schedule.id)
    }

    const scheduler = application.get('SchedulerService')
    const scheduleKey = `schedule:${schedule.id}`
    const trigger: Trigger = schedule.trigger
    const disp = scheduler.registerSchedule(scheduleKey, trigger, async () => {
      try {
        await this.enqueue(schedule.type as JobType, schedule.jobInputTemplate as never, {
          scheduleId: schedule.id
        })
        const nextRun = scheduler.getNextRun(scheduleKey)
        await jobScheduleService.markFired(schedule.id, Date.now(), nextRun?.getTime() ?? null)
      } catch (err) {
        logger.error('Schedule fire failed', { scheduleId: schedule.id, err: (err as Error).message })
      }
    })
    this.scheduleDisposables.set(schedule.id, disp)
  }

  /**
   * Schedule a `once` registration in the Scheduler so the delayed job gets
   * promoted + dispatched at its scheduledAt time. For `pending` jobs this
   * fast-path is skipped — the normal dispatch loop handles them.
   */
  private armDelayedJob(snapshot: JobSnapshot): void {
    const scheduler = application.get('SchedulerService')
    const jobKey = `job:${snapshot.id}`
    const scheduledMs = Date.parse(snapshot.scheduledAt)
    scheduler.registerSchedule(jobKey, { kind: 'once', at: scheduledMs }, async () => {
      await jobService.promoteDelayedDue(Date.now())
      void this.dispatch(snapshot.queue)
    })
  }

  private async detectAndDispatchOverdue(schedules: JobScheduleSnapshot[]): Promise<void> {
    const nowMs = Date.now()
    for (const schedule of schedules) {
      const handler = this.handlers.get(schedule.type)
      if (!handler) continue
      const action = computeCatchUpAction(schedule, handler, nowMs)
      if (action.missEvent && handler.onMissed) {
        try {
          await handler.onMissed(action.missEvent)
        } catch (err) {
          logger.warn('handler.onMissed threw — ignoring', {
            scheduleId: schedule.id,
            err: (err as Error).message
          })
        }
      }
      if (action.shouldEnqueue) {
        const scheduledAt = nowMs + action.enqueueDelayMs
        await this.enqueue(schedule.type as JobType, schedule.jobInputTemplate as never, {
          scheduleId: schedule.id,
          scheduledAt
        })
        logger.info('Catch-up enqueued', { scheduleId: schedule.id, type: schedule.type, scheduledAt })
      }
    }
  }

  // ---------------- GC ----------------

  private async runGC(): Promise<void> {
    const cutoff = Date.now() - GC_TERMINAL_TTL_MS
    const byTtl = await jobService.pruneTerminalOlderThan(cutoff)
    const byCount = await jobService.pruneTerminalKeepLatestPerType(GC_KEEP_PER_TYPE)
    if (byTtl + byCount > 0) {
      logger.info('GC pass', { byTtl, byCount })
    }
  }

  // ---------------- Helpers ----------------

  private handleFor(snapshot: JobSnapshot): JobHandle {
    const existing = this.finishedResolvers.get(snapshot.id)
    if (existing) {
      return { id: snapshot.id, snapshot, finished: existing.promise }
    }
    if (this.isTerminal(snapshot.status)) {
      return { id: snapshot.id, snapshot, finished: Promise.resolve(snapshot) }
    }
    let resolve!: (s: JobSnapshot) => void
    const promise = new Promise<JobSnapshot>((res) => {
      resolve = res
    })
    this.finishedResolvers.set(snapshot.id, { resolve, promise })
    return { id: snapshot.id, snapshot, finished: promise }
  }

  private isTerminal(status: JobSnapshot['status']): boolean {
    return status === 'completed' || status === 'failed' || status === 'cancelled'
  }

  private publishState(snapshot: JobSnapshot): void {
    application.get('CacheService').setShared(`${JOB_STATE_KEY_PREFIX}${snapshot.id}`, snapshot, 60_000)
  }

  private computeBackoff(policy: RetryPolicy, attempt: number): number {
    if (policy.backoff === 'none') return 0
    if (policy.backoff === 'fixed') return Math.min(policy.baseDelayMs, policy.maxDelayMs)
    // exponential: base * 2^(attempt-1)
    const exp = policy.baseDelayMs * Math.pow(2, Math.max(0, attempt - 1))
    return Math.min(exp, policy.maxDelayMs)
  }

  private parseJson(raw: string | null, fallback: unknown): unknown {
    if (raw == null) return fallback
    try {
      return JSON.parse(raw)
    } catch {
      return fallback
    }
  }

  private isAbortError(err: unknown): boolean {
    return err instanceof Error && (err.name === 'AbortError' || err.message.toLowerCase().includes('abort'))
  }

  private isTimeoutError(err: unknown): boolean {
    return err instanceof Error && err.message.includes('Timeout')
  }

  private makeError(code: string, message: string, params?: Record<string, unknown>): Error {
    const err = new Error(`${code}: ${message}`)
    ;(err as Error & { code: string; params?: Record<string, unknown>; retryable: boolean }).code = code
    ;(err as Error & { code: string; params?: Record<string, unknown>; retryable: boolean }).params = params
    ;(err as Error & { code: string; params?: Record<string, unknown>; retryable: boolean }).retryable = false
    return err
  }
}
