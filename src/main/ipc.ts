import { FileType } from '@types'
import { BrowserWindow, ipcMain, OpenDialogOptions, session, shell } from 'electron'

import { appConfig, titleBarOverlayDark, titleBarOverlayLight } from './config'
import AppUpdater from './services/AppUpdater'
import FileManager from './services/FileManager'
import { compress, decompress } from './utils/zip'
import { createMinappWindow } from './window'

const fileManager = new FileManager()

export function registerIpc(mainWindow: BrowserWindow, app: Electron.App) {
  const { autoUpdater } = new AppUpdater(mainWindow)

  // IPC
  ipcMain.handle('get-app-info', () => ({
    version: app.getVersion(),
    isPackaged: app.isPackaged,
    appPath: app.getAppPath()
  }))

  ipcMain.handle('open-website', (_, url: string) => {
    shell.openExternal(url)
  })

  ipcMain.handle('set-proxy', (_, proxy: string) => {
    session.defaultSession.setProxy(proxy ? { proxyRules: proxy } : {})
  })

  ipcMain.handle('reload', () => mainWindow.reload())

  ipcMain.handle('zip:compress', (_, text: string) => compress(text))
  ipcMain.handle('zip:decompress', (_, text: Buffer) => decompress(text))

  ipcMain.handle('file:open', fileManager.open)
  ipcMain.handle('file:save', fileManager.save)
  ipcMain.handle('file:saveImage', fileManager.saveImage)
  ipcMain.handle('file:base64Image', async (_, id) => await fileManager.base64Image(id))
  ipcMain.handle('file:select', async (_, options?: OpenDialogOptions) => await fileManager.selectFile(options))
  ipcMain.handle('file:upload', async (_, file: FileType) => await fileManager.uploadFile(file))
  ipcMain.handle('file:clear', async () => await fileManager.clear())
  ipcMain.handle('file:read', async (_, id: string) => await fileManager.readFile(id))
  ipcMain.handle('file:delete', async (_, id: string) => await fileManager.deleteFile(id))
  ipcMain.handle('file:get', async (_, filePath: string) => await fileManager.getFile(filePath))
  ipcMain.handle('file:create', async (_, fileName: string) => await fileManager.createTempFile(fileName))
  ipcMain.handle(
    'file:write',
    async (_, filePath: string, data: Uint8Array | string) => await fileManager.writeFile(filePath, data)
  )

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
}
