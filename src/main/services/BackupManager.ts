import { WebDavConfig } from '@types'
import archiver from 'archiver'
import { app } from 'electron'
import Logger from 'electron-log'
import * as fs from 'fs-extra'
import * as path from 'path'
import * as unzipper from 'unzipper'

import WebDav from './WebDav'

class BackupManager {
  private tempDir = path.join(app.getPath('temp'), 'cherry-studio', 'backup', 'temp')
  private backupDir = path.join(app.getPath('temp'), 'cherry-studio', 'backup')

  constructor() {
    this.backup = this.backup.bind(this)
    this.restore = this.restore.bind(this)
    this.backupToWebdav = this.backupToWebdav.bind(this)
    this.restoreFromWebdav = this.restoreFromWebdav.bind(this)
  }

  async backup(
    _: Electron.IpcMainInvokeEvent,
    fileName: string,
    data: string,
    destinationPath: string = this.backupDir
  ): Promise<string> {
    try {
      // 创建临时目录
      await fs.ensureDir(this.tempDir)

      // 将 data 写入临时文件
      const tempDataPath = path.join(this.tempDir, 'data.json')
      await fs.writeFile(tempDataPath, data)

      // 复制 Data 目录到临时目录
      const sourcePath = path.join(app.getPath('userData'), 'Data')
      const tempDataDir = path.join(this.tempDir, 'Data')
      await fs.copy(sourcePath, tempDataDir)

      // 创建 zip 文件
      const output = fs.createWriteStream(path.join(destinationPath, fileName))
      const archive = archiver('zip', { zlib: { level: 9 } })

      archive.pipe(output)
      archive.directory(this.tempDir, false)
      await archive.finalize()

      // 清理临时目录
      await fs.remove(this.tempDir)

      Logger.log('Backup completed successfully')

      const backupedFilePath = path.join(destinationPath, fileName)

      return backupedFilePath
    } catch (error) {
      Logger.error('Backup failed:', error)
      throw error
    }
  }

  async restore(_: Electron.IpcMainInvokeEvent, backupPath: string): Promise<string> {
    // 创建临时目录
    await fs.ensureDir(this.tempDir)

    // 解压备份文件到临时目录
    await fs
      .createReadStream(backupPath)
      .pipe(unzipper.Extract({ path: this.tempDir }))
      .promise()

    // 读取 data.json
    const dataPath = path.join(this.tempDir, 'data.json')
    const data = await fs.readFile(dataPath, 'utf-8')

    // 恢复 Data 目录
    const sourcePath = path.join(this.tempDir, 'Data')
    const destPath = path.join(app.getPath('userData'), 'Data')
    await fs.remove(destPath)
    await fs.copy(sourcePath, destPath)

    // 清理临时目录
    await fs.remove(this.tempDir)

    Logger.log('Restore completed successfully')

    return data
  }

  async backupToWebdav(_: Electron.IpcMainInvokeEvent, data: string, webdavConfig: WebDavConfig) {
    const filename = 'cherry-studio.backup.zip'
    const backupedFilePath = await this.backup(_, filename, data)
    const webdavClient = new WebDav(webdavConfig)
    return await webdavClient.putFileContents(filename, fs.createReadStream(backupedFilePath), {
      overwrite: true
    })
  }

  async restoreFromWebdav(_: Electron.IpcMainInvokeEvent, webdavConfig: WebDavConfig) {
    const filename = 'cherry-studio.backup.zip'
    const webdavClient = new WebDav(webdavConfig)
    const retrievedFile = await webdavClient.getFileContents(filename)
    const backupedFilePath = path.join(this.backupDir, filename)

    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true })
    }

    await fs.writeFileSync(backupedFilePath, retrievedFile as Buffer)

    return await this.restore(_, backupedFilePath)
  }
}

export default BackupManager
