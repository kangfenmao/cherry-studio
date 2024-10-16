import { BrowserWindow, dialog } from 'electron'
import logger from 'electron-log'
import { AppUpdater as _AppUpdater, autoUpdater, UpdateInfo } from 'electron-updater'

export default class AppUpdater {
  autoUpdater: _AppUpdater = autoUpdater

  constructor(mainWindow: BrowserWindow) {
    logger.transports.file.level = 'debug'
    autoUpdater.logger = logger
    autoUpdater.forceDevUpdateConfig = true
    autoUpdater.autoDownload = false

    // 检测下载错误
    autoUpdater.on('error', (error) => {
      logger.error('更新异常', error)
      mainWindow.webContents.send('update-error', error)
    })

    autoUpdater.on('update-available', (releaseInfo: UpdateInfo) => {
      autoUpdater.logger?.info('检测到新版本，确认是否下载')
      mainWindow.webContents.send('update-available', releaseInfo)

      const releaseNotes = releaseInfo.releaseNotes
      let releaseContent = ''

      if (releaseNotes) {
        if (typeof releaseNotes === 'string') {
          releaseContent = <string>releaseNotes
        } else if (releaseNotes instanceof Array) {
          releaseNotes.forEach((releaseNote) => {
            releaseContent += `${releaseNote}\n`
          })
        }
      } else {
        releaseContent = '暂无更新说明'
      }

      // 弹框确认是否下载更新（releaseContent是更新日志）
      dialog
        .showMessageBox({
          type: 'info',
          title: '应用有新的更新',
          detail: releaseContent,
          message: '发现新版本，是否现在更新？',
          buttons: ['下次再说', '更新']
        })
        .then(({ response }) => {
          if (response === 1) {
            logger.info('用户选择更新，准备下载更新')
            mainWindow.webContents.send('download-update')
            autoUpdater.downloadUpdate()
          }
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
    autoUpdater.on('update-downloaded', () => {
      logger.info('下载完成，准备更新')
      dialog
        .showMessageBox({
          title: '安装更新',
          message: '更新下载完毕，应用将重启并进行安装'
        })
        .then(() => {
          setImmediate(() => autoUpdater.quitAndInstall())
        })
    })

    this.autoUpdater = autoUpdater
  }
}
