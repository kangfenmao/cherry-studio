import { loggerService } from '@logger'
import type { JobScheduleSnapshot } from '@shared/data/api/schemas/jobs'

import type { JobHandler, JobMissEvent } from '../types'

const logger = loggerService.withContext('JobCatchUp')

/**
 * What the caller (JobManager) should do for this schedule.
 *
 * `shouldEnqueue=false + missEvent=null` means the schedule is fine — no
 * action needed. `shouldEnqueue=false + missEvent != null` means notify the
 * handler that a fire was missed but do not enqueue (skip-missed policy).
 */
export interface CatchUpAction {
  scheduleId: string
  type: string
  shouldEnqueue: boolean
  /** Delay before enqueuing the make-up job. Used by `after-startup`. */
  enqueueDelayMs: number
  missEvent: JobMissEvent | null
}

/**
 * Compute the catch-up action for one schedule given current time and the
 * handler registered for its type. Pure function — JobManager owns the
 * iteration and the actual side-effect dispatch.
 *
 * "Overdue" is decided by `schedule.nextRun <= now` — JobManager / Scheduler
 * keep `nextRun` updated. If `nextRun` is null (schedule was never armed or
 * one-shot already fired), the schedule is considered not overdue.
 *
 * Phase 1 catch-up policies:
 *   - skip-missed   : do NOT enqueue, but still emit missEvent (observability).
 *   - after-startup : enqueue once after `minutes * 60_000` ms; emit missEvent.
 *
 * `after-idle` is deferred (requires PowerMonitor.getSystemIdleTime API).
 */
export function computeCatchUpAction(schedule: JobScheduleSnapshot, handler: JobHandler, nowMs: number): CatchUpAction {
  const lastRunMs = schedule.lastRun ? Date.parse(schedule.lastRun) : null
  const nextRunMs = schedule.nextRun ? Date.parse(schedule.nextRun) : null
  const isOverdue = nextRunMs !== null && nextRunMs <= nowMs

  if (!isOverdue) {
    return { scheduleId: schedule.id, type: schedule.type, shouldEnqueue: false, enqueueDelayMs: 0, missEvent: null }
  }

  // Always build miss event when overdue + handler defines onMissed.
  // skip-missed still wants the event for observability / breaker logic.
  const missEvent: JobMissEvent | null = handler.onMissed
    ? {
        scheduleId: schedule.id,
        type: schedule.type,
        missedCount: 1,
        lastFireAt: lastRunMs
      }
    : null

  if (schedule.catchUpPolicy.kind === 'skip-missed') {
    logger.debug('Catch-up: skip-missed', { scheduleId: schedule.id, type: schedule.type })
    return { scheduleId: schedule.id, type: schedule.type, shouldEnqueue: false, enqueueDelayMs: 0, missEvent }
  }

  // after-startup
  const delayMs = schedule.catchUpPolicy.minutes * 60_000
  logger.debug('Catch-up: after-startup', { scheduleId: schedule.id, type: schedule.type, delayMs })
  return { scheduleId: schedule.id, type: schedule.type, shouldEnqueue: true, enqueueDelayMs: delayMs, missEvent }
}
