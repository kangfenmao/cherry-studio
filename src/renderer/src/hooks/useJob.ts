import { useSharedCache } from '@renderer/data/hooks/useCache'
import type { JobSnapshot } from '@shared/data/api/schemas/jobs'

/**
 * Subscribe to a job's live state in the renderer.
 *
 * Reads `jobs.state.${jobId}` from the shared cache — JobManager publishes a
 * fresh snapshot on every state transition (pending → running → completed /
 * failed / cancelled) and on progress reports. Cross-window sync is provided
 * by CacheService.
 *
 * Phase 1 behavior:
 *   - First render: `data` is null until JobManager pushes the initial snapshot.
 *   - During execution: `data` updates on each transition / progress report.
 *   - After terminal: snapshot persists for the cache TTL (60s), then null.
 *     Renderer treats post-TTL null as "job finished, no more updates needed".
 *
 * Phase 2 will add a DataApi fallback (GET /jobs/:id) so post-TTL recalls
 * still resolve the terminal snapshot. Until then, callers that need to
 * recover a job state after TTL should refetch via their own mechanism.
 */
export interface UseJobResult {
  data: JobSnapshot | null
  isTerminal: boolean
  isLoading: boolean
  error: Error | undefined
}

const TERMINAL_STATUSES: ReadonlySet<JobSnapshot['status']> = new Set(['completed', 'failed', 'cancelled'])

export function useJob(jobId: string): UseJobResult {
  const [snapshot] = useSharedCache(`jobs.state.${jobId}` as const)
  const data = snapshot ?? null
  const isTerminal = data ? TERMINAL_STATUSES.has(data.status) : false
  return { data, isTerminal, isLoading: false, error: undefined }
}
