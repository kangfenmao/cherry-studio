/* eslint-disable react/no-is-mounted */
import FileModel from '@main/database/models/FileModel'
import { getFileType } from '@main/utils/file'
import { FileMetadata } from '@types'
import * as crypto from 'crypto'
import { app, dialog, OpenDialogOptions } from 'electron'
import * as fs from 'fs'
import * as path from 'path'
import { v4 as uuidv4 } from 'uuid'

class File {
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
        type: fileType,
        count: 1
      }
    })

    return Promise.all(fileMetadataPromises)
  }

  async uploadFile(file: FileMetadata): Promise<FileMetadata> {
    const duplicateFile = await this.findDuplicateFile(file.path)

    if (duplicateFile) {
      // Increment the count for the duplicate file
      await FileModel.increment('count', { where: { id: duplicateFile.id } })

      // Fetch the updated file metadata
      return (await this.getFile(duplicateFile.id))!
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
      type: fileType,
      count: 1
    }

    await FileModel.create(fileMetadata)

    return fileMetadata
  }

  async deleteFile(fileId: string): Promise<void> {
    const fileMetadata = await this.getFile(fileId)
    if (fileMetadata) {
      if (fileMetadata.count > 1) {
        // Decrement the count if there are multiple references
        await FileModel.decrement('count', { where: { id: fileId } })
      } else {
        // Delete the file and database entry if this is the last reference
        await fs.promises.unlink(fileMetadata.path)
        await FileModel.destroy({ where: { id: fileId } })
      }
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

  async getFile(id: string): Promise<FileMetadata | null> {
    const file = await FileModel.findByPk(id)
    return file ? (file.toJSON() as FileMetadata) : null
  }

  async getAllFiles(): Promise<FileMetadata[]> {
    const files = await FileModel.findAll()
    return files.map((file) => file.toJSON() as FileMetadata)
  }
}

export default File
