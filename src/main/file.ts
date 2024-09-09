import { app, dialog } from 'electron'
import * as fs from 'fs'
import * as path from 'path'
import { v4 as uuidv4 } from 'uuid'

interface FileMetadata {
  id: string
  name: string
  path: string
  createdAt: Date
  size: number
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

  async selectFile(): Promise<FileMetadata | null> {
    const result = await dialog.showOpenDialog({
      properties: ['openFile']
    })

    if (result.canceled || result.filePaths.length === 0) {
      return null
    }

    const filePath = result.filePaths[0]
    const stats = fs.statSync(filePath)

    return {
      id: uuidv4(),
      name: path.basename(filePath),
      path: filePath,
      createdAt: stats.birthtime,
      size: stats.size
    }
  }

  async uploadFile(filePath: string): Promise<FileMetadata> {
    const id = uuidv4()
    const name = path.basename(filePath)
    const destPath = path.join(this.storageDir, id)

    await fs.promises.copyFile(filePath, destPath)
    const stats = await fs.promises.stat(destPath)

    return {
      id,
      name,
      path: destPath,
      createdAt: stats.birthtime,
      size: stats.size
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
