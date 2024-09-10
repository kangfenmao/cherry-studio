import * as crypto from 'crypto'
import { app, dialog, OpenDialogOptions } from 'electron'
import * as fs from 'fs'
import * as path from 'path'
import { v4 as uuidv4 } from 'uuid'

interface FileMetadata {
  id: string
  name: string
  fileName: string
  path: string
  size: number
  ext: string
  createdAt: Date
}

export class File {
  private storageDir: string

  constructor() {
    this.storageDir = path.join(app.getPath('userData'), 'Data', 'Files')
    this.initStorageDir()
  }

  private initStorageDir(): void {
    if (!fs.existsSync(this.storageDir)) {
      fs.mkdirSync(this.storageDir, { recursive: true })
    }
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
          return {
            id: path.basename(file, ext),
            name: path.basename(filePath),
            fileName: file,
            path: storedFilePath,
            createdAt: storedStats.birthtime,
            size: storedStats.size,
            ext: ext
          }
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

      return {
        id: uuidv4(),
        name: path.basename(filePath),
        fileName: path.basename(filePath),
        path: filePath,
        createdAt: stats.birthtime,
        size: stats.size,
        ext: ext
      }
    })

    return Promise.all(fileMetadataPromises)
  }

  async uploadFile(filePath: string): Promise<FileMetadata> {
    const duplicateFile = await this.findDuplicateFile(filePath)

    if (duplicateFile) {
      return duplicateFile
    }

    const uuid = uuidv4()
    const name = path.basename(filePath)
    const ext = path.extname(name)
    const destPath = path.join(this.storageDir, uuid + ext)

    await fs.promises.copyFile(filePath, destPath)
    const stats = await fs.promises.stat(destPath)

    return {
      id: uuid,
      name,
      fileName: uuid + ext,
      path: destPath,
      createdAt: stats.birthtime,
      size: stats.size,
      ext: ext
    }
  }

  async deleteFile(fileId: string): Promise<void> {
    const filePath = path.join(this.storageDir, fileId)
    await fs.promises.unlink(filePath)
  }

  async batchUploadFiles(filePaths: string[]): Promise<FileMetadata[]> {
    const uploadPromises = filePaths.map((filePath) => this.uploadFile(filePath))
    return Promise.all(uploadPromises)
  }

  async batchDeleteFiles(fileIds: string[]): Promise<void> {
    const deletePromises = fileIds.map((fileId) => this.deleteFile(fileId))
    await Promise.all(deletePromises)
  }
}
