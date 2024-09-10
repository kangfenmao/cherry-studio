import Database from 'better-sqlite3'
import { app } from 'electron'
import Logger from 'electron-log'
import * as fs from 'fs'
import * as path from 'path'

interface Migration {
  id: number
  name: string
  sql: string
}

export class DatabaseMigrator {
  private storageDir: string
  private db: Database.Database
  private migrationsDir: string

  constructor(migrationsDir: string) {
    this.storageDir = path.join(app.getPath('userData'), 'Data')
    this.migrationsDir = migrationsDir
    this.initStorageDir()
    this.initDatabase()
    this.initMigrationsTable()
  }

  private initStorageDir(): void {
    if (!fs.existsSync(this.storageDir)) {
      fs.mkdirSync(this.storageDir, { recursive: true })
    }
  }

  private initDatabase(): void {
    const dbPath = path.join(this.storageDir, 'data.db')
    this.db = new Database(dbPath)
  }

  private initMigrationsTable(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)
  }

  private getAppliedMigrations(): number[] {
    const stmt = this.db.prepare('SELECT id FROM migrations ORDER BY id')
    return stmt.all().map((row: any) => row.id)
  }

  private loadMigrations(): Migration[] {
    const files = fs.readdirSync(this.migrationsDir).filter((file) => file.endsWith('.sql'))
    return files
      .map((file) => {
        const [id, ...nameParts] = path.basename(file, '.sql').split('_')
        return {
          id: parseInt(id),
          name: nameParts.join('_'),
          sql: fs.readFileSync(path.join(this.migrationsDir, file), 'utf-8')
        }
      })
      .sort((a, b) => a.id - b.id)
  }

  public async migrate(): Promise<void> {
    const appliedMigrations = this.getAppliedMigrations()
    const allMigrations = this.loadMigrations()

    const pendingMigrations = allMigrations.filter((migration) => !appliedMigrations.includes(migration.id))

    this.db.exec('BEGIN TRANSACTION')

    try {
      for (const migration of pendingMigrations) {
        Logger.log(`Applying migration: ${migration.id}_${migration.name}`)
        this.db.exec(migration.sql)

        const insertStmt = this.db.prepare('INSERT INTO migrations (id, name) VALUES (?, ?)')
        insertStmt.run(migration.id, migration.name)
      }

      this.db.exec('COMMIT')
      Logger.log('All migrations applied successfully')
    } catch (error) {
      this.db.exec('ROLLBACK')
      Logger.error('Error applying migrations:', error)
      throw error
    }
  }

  public close(): void {
    this.db.close()
  }
}
