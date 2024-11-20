import { BrowserWindow, dialog } from 'electron'
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
    autoUpdater.on('update-downloaded', () => {
      logger.info('下载完成，询问用户是否更新')
      dialog
        .showMessageBox({
          type: 'info',
          title: '安装更新',
          message: '更新已下载完成，是否立即安装？',
          buttons: ['稍后安装', '立即安装'],
          defaultId: 1,
          cancelId: 0
        })
        .then(({ response }) => {
          if (response === 1) {
            setImmediate(() => autoUpdater.quitAndInstall())
          }
        })
    })

    this.autoUpdater = autoUpdater
  }
}
