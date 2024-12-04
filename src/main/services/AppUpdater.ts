import { app, BrowserWindow, dialog } from 'electron'
import logger from 'electron-log'
import { AppUpdater as _AppUpdater, autoUpdater, UpdateInfo } from 'electron-updater'

export default class AppUpdater {
  autoUpdater: _AppUpdater = autoUpdater

  constructor(mainWindow: BrowserWindow) {
    logger.transports.file.level = 'debug'
    autoUpdater.logger = logger
    autoUpdater.forceDevUpdateConfig = true
    autoUpdater.autoDownload = true

    // 检测下载错误
    autoUpdater.on('error', (error) => {
      logger.error('更新异常', error)
      mainWindow.webContents.send('update-error', error)
    })

    autoUpdater.on('update-available', (releaseInfo: UpdateInfo) => {
      autoUpdater.logger?.info('检测到新版本，开始自动下载')
      mainWindow.webContents.send('update-available', releaseInfo)

      dialog.showMessageBox({
        type: 'info',
        title: '正在下载新版本',
        message: `新版本 ${releaseInfo.version}`,
        detail: this.formatReleaseNotes(releaseInfo.releaseNotes)
      })
    })

    // 检测到不需要更新时
    autoUpdater.on('update-not-available', () => {
      mainWindow.webContents.send('update-not-available')
    })

    // 更新下载进度
    autoUpdater.on('download-progress', (progress) => {
      logger.info('下载进度', progress)
      mainWindow.webContents.send('download-progress', progress)
    })

    // 当需要更新的内容下载完成后
    autoUpdater.on('update-downloaded', (releaseInfo: UpdateInfo) => {
      logger.info('下载完成，询问用户是否更新', releaseInfo)

      dialog
        .showMessageBox({
          type: 'info',
          title: '安装更新',
          message: `新版本 ${releaseInfo.version} 已准备就绪`,
          detail: this.formatReleaseNotes(releaseInfo.releaseNotes),
          buttons: ['稍后安装', '立即安装'],
          defaultId: 1,
          cancelId: 0
        })
        .then(({ response }) => {
          if (response === 1) {
            app.isQuitting = true
            setImmediate(() => autoUpdater.quitAndInstall())
          }
        })
    })

    this.autoUpdater = autoUpdater
  }

  private formatReleaseNotes(releaseNotes: string | ReleaseNoteInfo[] | null | undefined): string {
    if (!releaseNotes) {
      return '暂无更新说明'
    }

    if (typeof releaseNotes === 'string') {
      return releaseNotes
    }

    return releaseNotes.map((note) => note.note).join('\n')
  }
}

interface ReleaseNoteInfo {
  readonly version: string
  readonly note: string | null
}
