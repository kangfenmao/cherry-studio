import archiver from 'archiver'
import { app } from 'electron'
import Logger from 'electron-log'
import * as fs from 'fs-extra'
import * as path from 'path'
import * as unzipper from 'unzipper'

class BackupManager {
  private tempDir: string

  constructor() {
    this.tempDir = path.join(app.getPath('temp'), 'CherryStudio', 'backup')
    this.backup = this.backup.bind(this)
    this.restore = this.restore.bind(this)
  }

  async backup(_: Electron.IpcMainInvokeEvent, data: string, fileName: string, destinationPath: string): Promise<void> {
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
      const output = fs.createWriteStream(path.join(destinationPath, `${fileName}.zip`))
      const archive = archiver('zip', { zlib: { level: 9 } })

      archive.pipe(output)
      archive.directory(this.tempDir, false)
      await archive.finalize()

      // 清理临时目录
      await fs.remove(this.tempDir)

      Logger.log('Backup completed successfully')
    } catch (error) {
      Logger.error('Backup failed:', error)
      throw error
    }
  }

  async restore(_: Electron.IpcMainInvokeEvent, backupPath: string): Promise<{ data: string; success: boolean }> {
    try {
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
      return { data, success: true }
    } catch (error) {
      Logger.error('Restore failed:', error)
      return { data: '', success: false }
    }
  }
}

export default BackupManager
