import path from 'node:path'

import { BrowserWindow, ipcMain, session, shell } from 'electron'

import { appConfig, titleBarOverlayDark, titleBarOverlayLight } from './config'
import AppUpdater from './services/AppUpdater'
import BackupManager from './services/BackupManager'
import { ExportService } from './services/ExportService'
import FileManager from './services/FileManager'
import { compress, decompress } from './utils/zip'
import { createMinappWindow } from './window'

const fileManager = new FileManager()
const backupManager = new BackupManager()
const exportService = new ExportService(fileManager)

export function registerIpc(mainWindow: BrowserWindow, app: Electron.App) {
  const { autoUpdater } = new AppUpdater(mainWindow)

  ipcMain.handle('app:info', () => ({
    version: app.getVersion(),
    isPackaged: app.isPackaged,
    appPath: app.getAppPath(),
    filesPath: path.join(app.getPath('userData'), 'Data', 'Files')
  }))

  ipcMain.handle('open-website', (_, url: string) => {
    shell.openExternal(url)
  })

  ipcMain.handle('set-proxy', (_, proxy: string) => {
    session.defaultSession.setProxy(proxy ? { proxyRules: proxy } : {})
  })

  ipcMain.handle('reload', () => mainWindow.reload())

  // zip
  ipcMain.handle('zip:compress', (_, text: string) => compress(text))
  ipcMain.handle('zip:decompress', (_, text: Buffer) => decompress(text))

  // backup
  ipcMain.handle('backup:backup', backupManager.backup)
  ipcMain.handle('backup:restore', backupManager.restore)
  ipcMain.handle('backup:backupToWebdav', backupManager.backupToWebdav)
  ipcMain.handle('backup:restoreFromWebdav', backupManager.restoreFromWebdav)

  // file
  ipcMain.handle('file:open', fileManager.open)
  ipcMain.handle('file:save', fileManager.save)
  ipcMain.handle('file:select', fileManager.selectFile)
  ipcMain.handle('file:upload', fileManager.uploadFile)
  ipcMain.handle('file:clear', fileManager.clear)
  ipcMain.handle('file:read', fileManager.readFile)
  ipcMain.handle('file:delete', fileManager.deleteFile)
  ipcMain.handle('file:get', fileManager.getFile)
  ipcMain.handle('file:selectFolder', fileManager.selectFolder)
  ipcMain.handle('file:create', fileManager.createTempFile)
  ipcMain.handle('file:write', fileManager.writeFile)
  ipcMain.handle('file:saveImage', fileManager.saveImage)
  ipcMain.handle('file:base64Image', fileManager.base64Image)
  ipcMain.handle('file:download', fileManager.downloadFile)
  ipcMain.handle('file:copy', fileManager.copyFile)

  // minapp
  ipcMain.handle('minapp', (_, args) => {
    createMinappWindow({
      url: args.url,
      parent: mainWindow,
      windowOptions: {
        ...mainWindow.getBounds(),
        ...args.windowOptions
      }
    })
  })

  // theme
  ipcMain.handle('set-theme', (_, theme: 'light' | 'dark') => {
    appConfig.set('theme', theme)
    mainWindow?.setTitleBarOverlay &&
      mainWindow.setTitleBarOverlay(theme === 'dark' ? titleBarOverlayDark : titleBarOverlayLight)
  })

  // 触发检查更新(此方法用于被渲染线程调用，例如页面点击检查更新按钮来调用此方法)
  ipcMain.handle('check-for-update', async () => {
    return {
      currentVersion: autoUpdater.currentVersion,
      update: await autoUpdater.checkForUpdates()
    }
  })

  ipcMain.handle('export:word', exportService.exportToWord)
}
