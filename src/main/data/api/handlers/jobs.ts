/**
 * Job API Handlers
 *
 * Read paths go through jobService (jobTable owning service); write paths go
 * through the JobManager lifecycle service so AbortControllers, cache pushes,
 * and dispatch state machine remain authoritative. Handler is the IPC trust
 * boundary — payload size / status enum / type whitelist are re-validated by
 * JobManager.enqueue and surfaced as JOB_* error codes.
 */

import { application } from '@application'
import { jobService } from '@data/services/JobService'
import type { JobType } from '@main/core/job/jobRegistry'
import { DataApiErrorFactory } from '@shared/data/api'
import type { HandlersFor } from '@shared/data/api/apiTypes'
import {
  CancelJobInputSchema,
  EnqueueJobInputSchema,
  type JobSchemas,
  ListJobsQuerySchema
} from '@shared/data/api/schemas/jobs'

export const jobHandlers: HandlersFor<JobSchemas> = {
  '/jobs': {
    GET: async ({ query }) => {
      const parsed = ListJobsQuerySchema.parse(query ?? {})
      return await jobService.list({
        status: parsed.status,
        queue: parsed.queue,
        type: parsed.type,
        scheduleId: parsed.scheduleId,
        limit: parsed.limit,
        offset: parsed.offset
      })
    },

    POST: async ({ body }) => {
      const parsed = EnqueueJobInputSchema.parse(body)
      const scheduledAtMs = parsed.scheduledAt ? Date.parse(parsed.scheduledAt) : undefined
      const handle = await application.get('JobManager').enqueue(parsed.type as JobType, parsed.input as never, {
        queue: parsed.queue,
        priority: parsed.priority,
        idempotencyKey: parsed.idempotencyKey,
        scheduledAt: scheduledAtMs,
        parentId: parsed.parentId,
        timeoutMs: parsed.timeoutMs,
        maxAttempts: parsed.maxAttempts,
        metadata: parsed.metadata
      })
      return handle.snapshot
    }
  },

  '/jobs/:id': {
    GET: async ({ params }) => {
      const snapshot = await jobService.getById(params.id)
      if (!snapshot) throw DataApiErrorFactory.notFound('Job', params.id)
      return snapshot
    },

    DELETE: async ({ params, query }) => {
      const existing = await jobService.getById(params.id)
      if (!existing) throw DataApiErrorFactory.notFound('Job', params.id)
      const parsedQuery = query ? CancelJobInputSchema.parse(query) : {}
      await application.get('JobManager').cancel(params.id, parsedQuery.reason)
      return undefined
    }
  }
}
