import Database from 'better-sqlite3'
import * as crypto from 'crypto'
import { app, dialog, OpenDialogOptions } from 'electron'
import * as fs from 'fs'
import * as path from 'path'
import { v4 as uuidv4 } from 'uuid'

import { FileMetadata } from '../renderer/src/types'
import { getFileType } from './utils/file'

export class File {
  private storageDir: string
  private db: Database.Database

  constructor() {
    this.storageDir = path.join(app.getPath('userData'), 'Data', 'Files')
    this.initStorageDir()
    this.initDatabase()
  }

  private initStorageDir(): void {
    if (!fs.existsSync(this.storageDir)) {
      fs.mkdirSync(this.storageDir, { recursive: true })
    }
  }

  private initDatabase(): void {
    const dbPath = path.join(app.getPath('userData'), 'Data', 'data.db')
    this.db = new Database(dbPath)
  }

  private async getFileHash(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash('md5')
      const stream = fs.createReadStream(filePath)
      stream.on('data', (data) => hash.update(data))
      stream.on('end', () => resolve(hash.digest('hex')))
      stream.on('error', reject)
    })
  }

  async findDuplicateFile(filePath: string): Promise<FileMetadata | null> {
    const stats = fs.statSync(filePath)
    const fileSize = stats.size

    const files = await fs.promises.readdir(this.storageDir)
    for (const file of files) {
      const storedFilePath = path.join(this.storageDir, file)
      const storedStats = fs.statSync(storedFilePath)

      if (storedStats.size === fileSize) {
        const [originalHash, storedHash] = await Promise.all([
          this.getFileHash(filePath),
          this.getFileHash(storedFilePath)
        ])

        if (originalHash === storedHash) {
          const ext = path.extname(file)
          const id = path.basename(file, ext)
          return this.getFile(id)
        }
      }
    }

    return null
  }

  async selectFile(options?: OpenDialogOptions): Promise<FileMetadata[] | null> {
    const defaultOptions: OpenDialogOptions = {
      properties: ['openFile']
    }

    const dialogOptions = { ...defaultOptions, ...options }

    const result = await dialog.showOpenDialog(dialogOptions)

    if (result.canceled || result.filePaths.length === 0) {
      return null
    }

    const fileMetadataPromises = result.filePaths.map(async (filePath) => {
      const stats = fs.statSync(filePath)
      const ext = path.extname(filePath)
      const fileType = getFileType(ext)

      return {
        id: uuidv4(),
        name: path.basename(filePath),
        file_name: path.basename(filePath),
        path: filePath,
        created_at: stats.birthtime,
        size: stats.size,
        ext: ext,
        type: fileType
      }
    })

    return Promise.all(fileMetadataPromises)
  }

  async uploadFile(file: FileMetadata): Promise<FileMetadata> {
    const duplicateFile = await this.findDuplicateFile(file.path)

    if (duplicateFile) {
      return duplicateFile
    }

    const uuid = uuidv4()
    const name = path.basename(file.path)
    const ext = path.extname(name)
    const destPath = path.join(this.storageDir, uuid + ext)

    await fs.promises.copyFile(file.path, destPath)
    const stats = await fs.promises.stat(destPath)
    const fileType = getFileType(ext)

    const fileMetadata: FileMetadata = {
      id: uuid,
      name,
      file_name: uuid + ext,
      path: destPath,
      created_at: stats.birthtime,
      size: stats.size,
      ext: ext,
      type: fileType
    }

    const stmt = this.db.prepare(`
      INSERT INTO files (id, name, file_name, path, size, ext, type, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `)

    stmt.run(
      fileMetadata.id,
      fileMetadata.name,
      fileMetadata.file_name,
      fileMetadata.path,
      fileMetadata.size,
      fileMetadata.ext,
      fileMetadata.type,
      fileMetadata.created_at.toISOString()
    )

    return fileMetadata
  }

  async deleteFile(fileId: string): Promise<void> {
    const fileMetadata = this.getFile(fileId)
    if (fileMetadata) {
      await fs.promises.unlink(fileMetadata.path)
      const stmt = this.db.prepare('DELETE FROM files WHERE id = ?')
      stmt.run(fileId)
    }
  }

  async batchUploadFiles(files: FileMetadata[]): Promise<FileMetadata[]> {
    const uploadPromises = files.map((file) => this.uploadFile(file))
    return Promise.all(uploadPromises)
  }

  async batchDeleteFiles(fileIds: string[]): Promise<void> {
    const deletePromises = fileIds.map((fileId) => this.deleteFile(fileId))
    await Promise.all(deletePromises)
  }

  getFile(id: string): FileMetadata | null {
    const stmt = this.db.prepare('SELECT * FROM files WHERE id = ?')
    const row = stmt.get(id) as any
    if (row) {
      return {
        ...row,
        created_at: new Date(row.created_at)
      }
    }
    return null
  }

  getAllFiles(): FileMetadata[] {
    const stmt = this.db.prepare('SELECT * FROM files')
    const rows = stmt.all() as any[]
    return rows.map((row) => ({
      ...row,
      created_at: new Date(row.created_at)
    }))
  }
}
