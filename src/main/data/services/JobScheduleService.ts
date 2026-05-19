import { application } from '@application'
import { type InsertJobScheduleRow, type JobScheduleRow, jobScheduleTable } from '@data/db/schemas/job'
import { defaultHandlersFor, withSqliteErrors } from '@data/db/sqliteErrors'
import type { DbOrTx } from '@data/db/types'
import { timestampToISO } from '@data/services/utils/rowMappers'
import { loggerService } from '@logger'
import { DataApiErrorFactory } from '@shared/data/api'
import {
  type CatchUpPolicy,
  type CreateJobScheduleDto,
  JOB_ERROR_CODES,
  JobScheduleNameAtomSchema,
  type JobScheduleSnapshot,
  type Trigger,
  type UpdateJobScheduleDto
} from '@shared/data/api/schemas/jobs'
import { and, asc, eq, type SQL } from 'drizzle-orm'

const logger = loggerService.withContext('JobScheduleService')

export interface JobScheduleListFilter {
  type?: string
  enabled?: boolean
  limit?: number
  offset?: number
}

/**
 * Owning entity service for `jobScheduleTable`. JobManager and DataApi handlers
 * reach the table through this service — no direct Drizzle access elsewhere.
 *
 * Single-instance invariant: when `name` is null the type must have at most one
 * schedule. SQLite treats every NULL as distinct so the DB unique index on
 * `(type, name)` cannot enforce this; we check at the application layer in
 * `create()` instead.
 */
export class JobScheduleService {
  private getDb(): DbOrTx {
    return application.get('DbService').getDb()
  }

  // ---------------- Read ----------------

  async listAll(filter: JobScheduleListFilter = {}): Promise<JobScheduleSnapshot[]> {
    const db = this.getDb()
    const conditions: SQL[] = []
    if (filter.type) conditions.push(eq(jobScheduleTable.type, filter.type))
    if (filter.enabled !== undefined) conditions.push(eq(jobScheduleTable.enabled, filter.enabled))

    const baseQuery = conditions.length
      ? db
          .select()
          .from(jobScheduleTable)
          .where(and(...conditions))
          .orderBy(asc(jobScheduleTable.createdAt))
      : db.select().from(jobScheduleTable).orderBy(asc(jobScheduleTable.createdAt))

    const rows =
      filter.limit !== undefined
        ? filter.offset !== undefined
          ? await baseQuery.limit(filter.limit).offset(filter.offset)
          : await baseQuery.limit(filter.limit)
        : await baseQuery

    return rows.map((r) => this.rowToSnapshot(r))
  }

  async listEnabled(): Promise<JobScheduleSnapshot[]> {
    const rows = await this.getDb()
      .select()
      .from(jobScheduleTable)
      .where(eq(jobScheduleTable.enabled, true))
      .orderBy(asc(jobScheduleTable.createdAt))
    return rows.map((r) => this.rowToSnapshot(r))
  }

  async getById(id: string): Promise<JobScheduleSnapshot | null> {
    const [row] = await this.getDb().select().from(jobScheduleTable).where(eq(jobScheduleTable.id, id)).limit(1)
    return row ? this.rowToSnapshot(row) : null
  }

  /**
   * Resolve a schedule by (type, name?). Returns null when not found so the
   * caller (JobManager) can wrap absence into a typed error with a
   * `knownNames` list for better DX.
   *
   * When `name` is omitted:
   *   - 0 schedules → null
   *   - exactly 1 → return it
   *   - more than 1 → throw — caller must pass an explicit name
   */
  async getByTypeAndName(type: string, name?: string | null): Promise<JobScheduleSnapshot | null> {
    const db = this.getDb()
    if (name == null) {
      const rows = await db.select().from(jobScheduleTable).where(eq(jobScheduleTable.type, type)).limit(2)
      if (rows.length === 0) return null
      if (rows.length > 1) {
        throw DataApiErrorFactory.invalidOperation(
          `getByTypeAndName: type "${type}" has multiple schedules — name is required to disambiguate`
        )
      }
      return this.rowToSnapshot(rows[0])
    }
    const [row] = await db
      .select()
      .from(jobScheduleTable)
      .where(and(eq(jobScheduleTable.type, type), eq(jobScheduleTable.name, name)))
      .limit(1)
    return row ? this.rowToSnapshot(row) : null
  }

  /** All known names for a type — JobManager uses this to build error context. */
  async listNamesForType(type: string): Promise<Array<string | null>> {
    const rows = await this.getDb()
      .select({ name: jobScheduleTable.name })
      .from(jobScheduleTable)
      .where(eq(jobScheduleTable.type, type))
    return rows.map((r) => r.name)
  }

  /**
   * Schedules eligible for catch-up evaluation. Phase 1 returns all enabled
   * schedules — JobManager applies the per-schedule policy. Filtering more
   * aggressively here would duplicate policy knowledge from JobManager.
   */
  async getCatchUpCandidates(): Promise<JobScheduleSnapshot[]> {
    return this.listEnabled()
  }

  // ---------------- Write ----------------

  async create(dto: CreateJobScheduleDto): Promise<JobScheduleSnapshot> {
    if (dto.name != null) {
      const parsed = JobScheduleNameAtomSchema.safeParse(dto.name)
      if (!parsed.success) {
        throw DataApiErrorFactory.invalidOperation(
          `Invalid schedule name: ${parsed.error.issues.map((i) => i.message).join('; ')}`
        )
      }
    } else {
      // Single-instance invariant: when name is null this type must have no schedules.
      const existing = await this.getDb()
        .select({ id: jobScheduleTable.id })
        .from(jobScheduleTable)
        .where(eq(jobScheduleTable.type, dto.type))
        .limit(1)
      if (existing[0]) {
        throw DataApiErrorFactory.invalidOperation(
          `${JOB_ERROR_CODES.SCHEDULE_SINGLETON_EXISTS}: Cannot create unnamed schedule for type "${dto.type}" — it already has schedules. Provide a name to make it multi-instance.`
        )
      }
    }

    const insertData: InsertJobScheduleRow = {
      type: dto.type,
      name: dto.name ?? null,
      trigger: JSON.stringify(dto.trigger),
      jobInputTemplate: JSON.stringify(dto.jobInputTemplate),
      catchUpPolicy: JSON.stringify(dto.catchUpPolicy),
      enabled: dto.enabled ?? true,
      metadata: JSON.stringify(dto.metadata ?? {})
    }

    const result = await withSqliteErrors(() => this.getDb().insert(jobScheduleTable).values(insertData).returning(), {
      ...defaultHandlersFor('JobSchedule', '<auto>'),
      unique: () =>
        DataApiErrorFactory.conflict(
          'JobSchedule',
          `${JOB_ERROR_CODES.SCHEDULE_NAME_CONFLICT}: name "${dto.name ?? '<unnamed>'}" already exists for type "${dto.type}"`
        )
    })
    const row = result[0]
    if (!row) throw new Error('jobScheduleService.create returned no row')
    logger.info('JobSchedule created', { id: row.id, type: dto.type, name: dto.name })
    return this.rowToSnapshot(row)
  }

  async update(id: string, patch: UpdateJobScheduleDto): Promise<JobScheduleSnapshot | null> {
    if (patch.name != null) {
      const parsed = JobScheduleNameAtomSchema.safeParse(patch.name)
      if (!parsed.success) {
        throw DataApiErrorFactory.invalidOperation(
          `Invalid schedule name: ${parsed.error.issues.map((i) => i.message).join('; ')}`
        )
      }
    }

    const updateData: Partial<InsertJobScheduleRow> = { updatedAt: Date.now() }
    if (patch.name !== undefined) updateData.name = patch.name
    if (patch.trigger !== undefined) updateData.trigger = JSON.stringify(patch.trigger)
    if (patch.jobInputTemplate !== undefined) updateData.jobInputTemplate = JSON.stringify(patch.jobInputTemplate)
    if (patch.catchUpPolicy !== undefined) updateData.catchUpPolicy = JSON.stringify(patch.catchUpPolicy)
    if (patch.enabled !== undefined) updateData.enabled = patch.enabled
    if (patch.metadata !== undefined) updateData.metadata = JSON.stringify(patch.metadata)

    const result = await withSqliteErrors(
      () => this.getDb().update(jobScheduleTable).set(updateData).where(eq(jobScheduleTable.id, id)).returning(),
      defaultHandlersFor('JobSchedule', id)
    )
    const row = result[0]
    if (!row) return null
    logger.info('JobSchedule updated', { id })
    return this.rowToSnapshot(row)
  }

  async setEnabled(id: string, enabled: boolean): Promise<boolean> {
    const result = await this.getDb()
      .update(jobScheduleTable)
      .set({ enabled, updatedAt: Date.now() })
      .where(eq(jobScheduleTable.id, id))
    return result.rowsAffected > 0
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.getDb().delete(jobScheduleTable).where(eq(jobScheduleTable.id, id))
    logger.info('JobSchedule deleted', { id, deleted: result.rowsAffected > 0 })
    return result.rowsAffected > 0
  }

  /**
   * Record a fire event: set lastRun to the actual fire timestamp and nextRun
   * to the next expected fire (or null for terminal one-shot / no-more-runs).
   * Called from the SchedulerService callback after each fire.
   */
  async markFired(id: string, lastRun: number, nextRun: number | null): Promise<void> {
    await this.getDb()
      .update(jobScheduleTable)
      .set({ lastRun, nextRun, updatedAt: Date.now() })
      .where(eq(jobScheduleTable.id, id))
  }

  // ---------------- Row → Entity ----------------

  /**
   * Row → entity mapping. Like JobService.rowToSnapshot, this is written
   * explicitly rather than via `{...nullsToUndefined(row)}` because the
   * snapshot fields are `.nullable()` (not `.optional()`) to keep the IPC
   * boundary clean. See JobService.rowToSnapshot for the rationale.
   */
  rowToSnapshot(row: JobScheduleRow): JobScheduleSnapshot {
    return {
      id: row.id,
      type: row.type,
      name: row.name,
      trigger: this.parseJson(row.trigger) as Trigger,
      jobInputTemplate: this.parseJson(row.jobInputTemplate),
      enabled: row.enabled,
      nextRun: row.nextRun != null ? timestampToISO(row.nextRun) : null,
      lastRun: row.lastRun != null ? timestampToISO(row.lastRun) : null,
      catchUpPolicy: this.parseJson(row.catchUpPolicy) as CatchUpPolicy,
      metadata: (this.parseJson(row.metadata) as Record<string, unknown>) ?? {},
      createdAt: timestampToISO(row.createdAt),
      updatedAt: timestampToISO(row.updatedAt)
    }
  }

  private parseJson(raw: string): unknown {
    try {
      return JSON.parse(raw)
    } catch (err) {
      logger.warn('Failed to parse JSON field', { rawHead: raw.slice(0, 100), error: (err as Error).message })
      return {}
    }
  }
}

export const jobScheduleService = new JobScheduleService()
