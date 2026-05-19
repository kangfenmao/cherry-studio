import { application } from '@application'
import { type InsertJobRow, type JobRow, jobTable } from '@data/db/schemas/job'
import { defaultHandlersFor, withSqliteErrors } from '@data/db/sqliteErrors'
import type { DbOrTx } from '@data/db/types'
import { timestampToISO } from '@data/services/utils/rowMappers'
import { loggerService } from '@logger'
import { type JobError, type JobSnapshot, type JobStatus, TERMINAL_JOB_STATUSES } from '@shared/data/api/schemas/jobs'
import { and, asc, count, desc, eq, inArray, lte, type SQL } from 'drizzle-orm'

const logger = loggerService.withContext('JobService')

const NON_TERMINAL_STATUSES = ['pending', 'delayed', 'running'] as const satisfies readonly JobStatus[]

export interface JobListFilter {
  status?: JobStatus[]
  queue?: string
  type?: string
  scheduleId?: string
  limit?: number
  offset?: number
}

/**
 * Owning entity service for `jobTable`. JobManager and DataApi handlers reach
 * the table through this service — no direct Drizzle access elsewhere.
 *
 * Tx-scoped methods (suffix `Tx`) accept a `DbOrTx` so JobManager can call them
 * inside its dispatch transaction (Layer 0 + Layer 1 mutex protect the section).
 * Non-tx methods use the singleton db handle via `this.getDb()`.
 */
export class JobService {
  private getDb(): DbOrTx {
    return application.get('DbService').getDb()
  }

  // ---------------- Read ----------------

  async list(filter: JobListFilter = {}): Promise<JobSnapshot[]> {
    const db = this.getDb()
    const conditions: SQL[] = []
    if (filter.status?.length) conditions.push(inArray(jobTable.status, filter.status))
    if (filter.queue) conditions.push(eq(jobTable.queue, filter.queue))
    if (filter.type) conditions.push(eq(jobTable.type, filter.type))
    if (filter.scheduleId) conditions.push(eq(jobTable.scheduleId, filter.scheduleId))

    const baseQuery = conditions.length
      ? db
          .select()
          .from(jobTable)
          .where(and(...conditions))
          .orderBy(desc(jobTable.createdAt))
      : db.select().from(jobTable).orderBy(desc(jobTable.createdAt))

    const rows =
      filter.limit !== undefined
        ? filter.offset !== undefined
          ? await baseQuery.limit(filter.limit).offset(filter.offset)
          : await baseQuery.limit(filter.limit)
        : await baseQuery

    return rows.map((r) => this.rowToSnapshot(r))
  }

  async getById(id: string): Promise<JobSnapshot | null> {
    const [row] = await this.getDb().select().from(jobTable).where(eq(jobTable.id, id)).limit(1)
    return row ? this.rowToSnapshot(row) : null
  }

  /**
   * Find any non-terminal job with the given idempotency key. JobManager.enqueue
   * calls this for cross-restart deduplication: if a result is returned, reuse
   * the existing job's handle instead of creating a new row.
   */
  async findActiveByIdempotencyKey(key: string): Promise<JobSnapshot | null> {
    const [row] = await this.getDb()
      .select()
      .from(jobTable)
      .where(and(eq(jobTable.idempotencyKey, key), inArray(jobTable.status, NON_TERMINAL_STATUSES)))
      .limit(1)
    return row ? this.rowToSnapshot(row) : null
  }

  /**
   * The last N terminal jobs for a schedule, ordered by finishedAt DESC.
   * Used by handler.onSettled to implement circuit-breaker logic without a
   * separate tracker table — jobTable is the single source of truth.
   */
  async listRecentTerminalByScheduleId(scheduleId: string, limit: number): Promise<JobSnapshot[]> {
    const rows = await this.getDb()
      .select()
      .from(jobTable)
      .where(and(eq(jobTable.scheduleId, scheduleId), inArray(jobTable.status, TERMINAL_JOB_STATUSES)))
      .orderBy(desc(jobTable.finishedAt))
      .limit(limit)
    return rows.map((r) => this.rowToSnapshot(r))
  }

  // ---------------- Write (non-tx) ----------------

  async create(dto: InsertJobRow): Promise<JobSnapshot> {
    const result = await withSqliteErrors(
      () => this.getDb().insert(jobTable).values(dto).returning(),
      defaultHandlersFor('Job', dto.id ?? '<auto>')
    )
    const row = result[0]
    if (!row) throw new Error('jobService.create returned no row')
    return this.rowToSnapshot(row)
  }

  // ---------------- Tx-scoped (inside JobManager.dispatch transaction) ----------------

  /** Count pending+delayed+running jobs for a queue — checks queue concurrency. */
  async countActiveByQueueTx(tx: DbOrTx, queue: string): Promise<number> {
    const [r] = await tx
      .select({ count: count() })
      .from(jobTable)
      .where(and(eq(jobTable.queue, queue), inArray(jobTable.status, NON_TERMINAL_STATUSES)))
    return r?.count ?? 0
  }

  /**
   * Count currently-running jobs across all queues — checks globalMaxConcurrency.
   * Only `running` counts toward the global cap: pending/delayed do not occupy
   * worker slots.
   */
  async countActiveGlobalTx(tx: DbOrTx): Promise<number> {
    const [r] = await tx.select({ count: count() }).from(jobTable).where(eq(jobTable.status, 'running'))
    return r?.count ?? 0
  }

  /**
   * Atomically claim the next pending job in a queue and transition it to
   * running. The double-mutex (Layer 0 global + Layer 1 per-queue) outside this
   * tx ensures no two callers race on the same queue; the optimistic
   * `WHERE status='pending'` is a belt-and-suspenders guard. Returns the
   * claimed row (already updated to `running`) or null if none available.
   */
  async claimNextPendingTx(tx: DbOrTx, queue: string): Promise<JobRow | null> {
    const now = Date.now()
    const [candidate] = await tx
      .select()
      .from(jobTable)
      .where(and(eq(jobTable.queue, queue), eq(jobTable.status, 'pending'), lte(jobTable.scheduledAt, now)))
      .orderBy(asc(jobTable.priority), asc(jobTable.scheduledAt))
      .limit(1)
    if (!candidate) return null

    const updated = await tx
      .update(jobTable)
      .set({ status: 'running', startedAt: now, updatedAt: now })
      .where(and(eq(jobTable.id, candidate.id), eq(jobTable.status, 'pending')))
      .returning()
    return updated[0] ?? null
  }

  /** Move a job to a terminal state, persisting output and/or error. */
  async setTerminalTx(
    tx: DbOrTx,
    jobId: string,
    status: 'completed' | 'failed' | 'cancelled',
    output: unknown | undefined,
    error: JobError | null
  ): Promise<void> {
    const now = Date.now()
    await tx
      .update(jobTable)
      .set({
        status,
        finishedAt: now,
        updatedAt: now,
        output: output !== undefined ? JSON.stringify(output) : null,
        error: error ? JSON.stringify(error) : null
      })
      .where(eq(jobTable.id, jobId))
  }

  /**
   * Re-schedule a failed job for retry. Caller computes `scheduledAt = now + backoff(attempt+1)`.
   * Resets startedAt; preserves output/scheduleId/idempotencyKey.
   */
  async setDelayedRetryTx(
    tx: DbOrTx,
    jobId: string,
    attempt: number,
    scheduledAt: number,
    error: JobError | null
  ): Promise<void> {
    const now = Date.now()
    await tx
      .update(jobTable)
      .set({
        status: 'delayed',
        attempt,
        scheduledAt,
        startedAt: null,
        updatedAt: now,
        error: error ? JSON.stringify(error) : null
      })
      .where(eq(jobTable.id, jobId))
  }

  async setCancelRequestedTx(tx: DbOrTx, jobId: string): Promise<void> {
    const now = Date.now()
    await tx.update(jobTable).set({ cancelRequested: true, updatedAt: now }).where(eq(jobTable.id, jobId))
  }

  /**
   * Atomically replace jobTable.metadata. Used by JobContext.patchMetadata
   * to persist cross-restart state (e.g. remote-poll providerTaskId). The
   * caller computes the merged JSON outside this method (so the in-memory
   * row's metadata stays in sync without a re-fetch) and passes the final
   * stringified payload in.
   */
  async setMetadataTx(tx: DbOrTx, jobId: string, mergedMetadataJson: string): Promise<void> {
    const now = Date.now()
    await tx.update(jobTable).set({ metadata: mergedMetadataJson, updatedAt: now }).where(eq(jobTable.id, jobId))
  }

  // ---------------- Startup recovery (JobManager.onReady) ----------------

  /** All jobs currently marked `running` — typically orphans from a crash. */
  async getStaleRunning(): Promise<JobRow[]> {
    return this.getDb().select().from(jobTable).where(eq(jobTable.status, 'running'))
  }

  /** All non-terminal jobs for a type, sorted newest first — singleton recovery uses this. */
  async getNonTerminalByType(type: string): Promise<JobRow[]> {
    return this.getDb()
      .select()
      .from(jobTable)
      .where(and(eq(jobTable.type, type), inArray(jobTable.status, NON_TERMINAL_STATUSES)))
      .orderBy(desc(jobTable.createdAt))
  }

  async resetToPendingByIds(jobIds: string[]): Promise<void> {
    if (jobIds.length === 0) return
    const now = Date.now()
    await this.getDb()
      .update(jobTable)
      .set({ status: 'pending', startedAt: null, updatedAt: now })
      .where(inArray(jobTable.id, jobIds))
  }

  async cancelByIds(jobIds: string[], error: JobError | null): Promise<void> {
    if (jobIds.length === 0) return
    const now = Date.now()
    await this.getDb()
      .update(jobTable)
      .set({
        status: 'cancelled',
        finishedAt: now,
        updatedAt: now,
        error: error ? JSON.stringify(error) : null
      })
      .where(inArray(jobTable.id, jobIds))
  }

  /**
   * Cancel all non-terminal jobs matching a queue/type filter. Splits targets:
   *   - running rows: mark cancelRequested=true. Caller aborts the in-flight
   *     AbortController; handler observes signal.aborted and terminates;
   *     normal finalize transitions the row to 'cancelled'.
   *   - pending/delayed rows: transition directly to 'cancelled'.
   *
   * Returns `runningIds` (so the caller can abort their controllers) and
   * `transitioned` (count of pending/delayed rows finalized synchronously).
   * Used by JobManager.cancelMany — covers Phase 4 Knowledge reset() and
   * FileProcessing batch cancellation semantics.
   */
  async cancelManyTx(
    tx: DbOrTx,
    filter: { queue?: string; type?: string },
    error: JobError | null
  ): Promise<{ runningIds: string[]; transitioned: number }> {
    const conditions: SQL[] = [inArray(jobTable.status, NON_TERMINAL_STATUSES)]
    if (filter.queue) conditions.push(eq(jobTable.queue, filter.queue))
    if (filter.type) conditions.push(eq(jobTable.type, filter.type))

    const matching = await tx
      .select()
      .from(jobTable)
      .where(and(...conditions))
    const runningIds = matching.filter((r) => r.status === 'running').map((r) => r.id)
    const nonRunningIds = matching.filter((r) => r.status !== 'running').map((r) => r.id)

    const now = Date.now()
    if (runningIds.length) {
      await tx.update(jobTable).set({ cancelRequested: true, updatedAt: now }).where(inArray(jobTable.id, runningIds))
    }
    let transitioned = 0
    if (nonRunningIds.length) {
      const result = await tx
        .update(jobTable)
        .set({
          status: 'cancelled',
          finishedAt: now,
          updatedAt: now,
          error: error ? JSON.stringify(error) : null
        })
        .where(inArray(jobTable.id, nonRunningIds))
      transitioned = result.rowsAffected
    }
    return { runningIds, transitioned }
  }

  // ---------------- Delayed → pending promotion ----------------

  /**
   * Promote delayed jobs whose `scheduledAt` has passed into `pending` so the
   * dispatch loop picks them up. Returns the count of rows promoted.
   */
  async promoteDelayedDue(now: number): Promise<number> {
    const result = await this.getDb()
      .update(jobTable)
      .set({ status: 'pending', updatedAt: now })
      .where(and(eq(jobTable.status, 'delayed'), lte(jobTable.scheduledAt, now)))
    return result.rowsAffected
  }

  // ---------------- GC ----------------

  /** Delete terminal jobs whose finishedAt is older than the cutoff. */
  async pruneTerminalOlderThan(cutoffMs: number): Promise<number> {
    const result = await this.getDb()
      .delete(jobTable)
      .where(and(inArray(jobTable.status, TERMINAL_JOB_STATUSES), lte(jobTable.finishedAt, cutoffMs)))
    return result.rowsAffected
  }

  /**
   * Keep only the latest `keepPerType` terminal jobs per type; delete the rest.
   * At Phase 1 scale (thousands of terminal rows total) this in-memory pass is
   * cheaper than a window-function SQL and portable across SQLite versions.
   */
  async pruneTerminalKeepLatestPerType(keepPerType: number): Promise<number> {
    const allTerminal = await this.getDb()
      .select({ id: jobTable.id, type: jobTable.type })
      .from(jobTable)
      .where(inArray(jobTable.status, TERMINAL_JOB_STATUSES))
      .orderBy(desc(jobTable.finishedAt))

    const perType = new Map<string, number>()
    const toDelete: string[] = []
    for (const row of allTerminal) {
      const c = (perType.get(row.type) ?? 0) + 1
      perType.set(row.type, c)
      if (c > keepPerType) toDelete.push(row.id)
    }
    if (toDelete.length === 0) return 0
    const result = await this.getDb().delete(jobTable).where(inArray(jobTable.id, toDelete))
    return result.rowsAffected
  }

  // ---------------- Row → Entity ----------------

  /**
   * Row → entity mapping. Intentionally explicit rather than the
   * `{...nullsToUndefined(row), ...}` skeleton from data-api-in-main.md.
   *
   * JobSnapshot's nullable fields are declared as `.nullable()` (not
   * `.optional()`) so DB NULL → snapshot null cleanly crosses the IPC
   * boundary. `nullsToUndefined` would actively break that — it turns
   * `string | null` into `string | undefined`, forcing every renderer reader
   * to handle a third state. The explicit mapping below preserves the
   * T|null shape directly. notNull columns (id / type / status / queue /
   * scheduledAt / attempt / maxAttempts / cancelRequested / metadata /
   * createdAt / updatedAt) cannot hold NULL at the DB level, so there is
   * nothing for `nullsToUndefined` to translate anyway.
   */
  rowToSnapshot(row: JobRow): JobSnapshot {
    return {
      id: row.id,
      type: row.type,
      status: row.status as JobStatus,
      priority: row.priority,
      queue: row.queue,
      idempotencyKey: row.idempotencyKey,
      scheduleId: row.scheduleId,
      scheduledAt: timestampToISO(row.scheduledAt),
      startedAt: row.startedAt != null ? timestampToISO(row.startedAt) : null,
      finishedAt: row.finishedAt != null ? timestampToISO(row.finishedAt) : null,
      attempt: row.attempt,
      maxAttempts: row.maxAttempts,
      input: this.parseJson(row.input, undefined),
      output: row.output != null ? this.parseJson(row.output, null) : null,
      error: row.error != null ? (this.parseJson(row.error, null) as JobError | null) : null,
      parentId: row.parentId,
      cancelRequested: row.cancelRequested,
      metadata: (this.parseJson(row.metadata, {}) as Record<string, unknown>) ?? {},
      timeoutMs: row.timeoutMs,
      createdAt: timestampToISO(row.createdAt),
      updatedAt: timestampToISO(row.updatedAt)
    }
  }

  private parseJson(raw: string | null, fallback: unknown): unknown {
    if (raw == null) return fallback
    try {
      return JSON.parse(raw)
    } catch (err) {
      logger.warn('Failed to parse JSON field', { rawHead: raw.slice(0, 100), error: (err as Error).message })
      return fallback
    }
  }
}

export const jobService = new JobService()
