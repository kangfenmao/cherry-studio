import { jobService } from '@data/services/JobService'
import { loggerService } from '@logger'
import { JOB_ERROR_CODES, type JobError } from '@shared/data/api/schemas/jobs'

import type { JobHandler } from '../types'

const logger = loggerService.withContext('JobRecovery')

export interface RecoveryStats {
  cancelled: number
  pendingReset: number
  delayedKept: number
  singletonKept: number
}

/**
 * Per-processor declarative recovery. Walks the registered handlers, applies
 * each type's `recovery` strategy to its non-terminal jobs, then handles
 * orphan running jobs whose handler is no longer registered.
 *
 * Step order matters: cancelRequested=true overrides any strategy — those
 * jobs are cancelled regardless. The strategy then applies to the rest.
 */
export async function runStartupRecovery(handlers: ReadonlyMap<string, JobHandler>): Promise<RecoveryStats> {
  const stats: RecoveryStats = { cancelled: 0, pendingReset: 0, delayedKept: 0, singletonKept: 0 }
  const cancelledByRecovery: JobError = {
    code: JOB_ERROR_CODES.CANCELLED,
    message: 'Cancelled by startup recovery',
    retryable: false
  }

  for (const [type, handler] of handlers) {
    const nonTerminal = await jobService.getNonTerminalByType(type)
    if (nonTerminal.length === 0) continue

    // 1. cancelRequested → cancelled, regardless of strategy.
    const cancelRequestedIds = nonTerminal
      .filter((r) => r.cancelRequested && (r.status === 'running' || r.status === 'delayed'))
      .map((r) => r.id)
    if (cancelRequestedIds.length) {
      await jobService.cancelByIds(cancelRequestedIds, cancelledByRecovery)
      stats.cancelled += cancelRequestedIds.length
      logger.info('Cancelled jobs with cancelRequested=true', { type, count: cancelRequestedIds.length })
    }

    const cancelRequestedSet = new Set(cancelRequestedIds)
    const remaining = nonTerminal.filter((r) => !cancelRequestedSet.has(r.id))

    // 2. Apply strategy to the rest.
    if (handler.recovery === 'abandon') {
      const ids = remaining.map((r) => r.id)
      if (ids.length) {
        await jobService.cancelByIds(ids, cancelledByRecovery)
        stats.cancelled += ids.length
        logger.info('Abandon recovery: cancelled non-terminal', { type, count: ids.length })
      }
    } else if (handler.recovery === 'retry') {
      const runningIds = remaining.filter((r) => r.status === 'running').map((r) => r.id)
      const delayedCount = remaining.filter((r) => r.status === 'delayed').length
      if (runningIds.length) {
        await jobService.resetToPendingByIds(runningIds)
        stats.pendingReset += runningIds.length
      }
      stats.delayedKept += delayedCount
      if (runningIds.length || delayedCount) {
        logger.info('Retry recovery', { type, reset: runningIds.length, delayedKept: delayedCount })
      }
    } else if (handler.recovery === 'singleton') {
      if (remaining.length === 0) continue
      // remaining is already sorted by createdAt DESC (jobService contract).
      const keep = remaining[0]
      if (keep.status === 'running') {
        await jobService.resetToPendingByIds([keep.id])
        stats.pendingReset += 1
      }
      stats.singletonKept += 1
      const toCancelIds = remaining.slice(1).map((r) => r.id)
      if (toCancelIds.length) {
        await jobService.cancelByIds(toCancelIds, cancelledByRecovery)
        stats.cancelled += toCancelIds.length
      }
      logger.info('Singleton recovery', {
        type,
        keptId: keep.id,
        keptStatus: keep.status,
        cancelled: toCancelIds.length
      })
    }
  }

  // 3. Orphan running jobs — handler no longer registered. Cancel them so they
  // do not hang in 'running' forever (would block dispatch via active count).
  const allRunning = await jobService.getStaleRunning()
  const orphanIds = allRunning.filter((r) => !handlers.has(r.type)).map((r) => r.id)
  if (orphanIds.length) {
    await jobService.cancelByIds(orphanIds, {
      code: JOB_ERROR_CODES.CANCELLED,
      message: 'Orphan job: handler no longer registered',
      retryable: false
    })
    stats.cancelled += orphanIds.length
    logger.warn('Cancelled orphan running jobs (no handler registered)', {
      count: orphanIds.length,
      types: Array.from(new Set(allRunning.filter((r) => !handlers.has(r.type)).map((r) => r.type)))
    })
  }

  return stats
}
