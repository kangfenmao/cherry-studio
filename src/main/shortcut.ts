import { BrowserWindow, globalShortcut } from 'electron'

export function registerZoomShortcut(mainWindow: BrowserWindow) {
  // 注册放大快捷键 (Ctrl+Plus 或 Cmd+Plus)
  globalShortcut.register('CommandOrControl+=', () => {
    if (mainWindow) {
      const currentZoom = mainWindow.webContents.getZoomFactor()
      mainWindow.webContents.setZoomFactor(currentZoom + 0.1)
    }
  })

  // 注册缩小快捷键 (Ctrl+Minus 或 Cmd+Minus)
  globalShortcut.register('CommandOrControl+-', () => {
    if (mainWindow) {
      const currentZoom = mainWindow.webContents.getZoomFactor()
      mainWindow.webContents.setZoomFactor(currentZoom - 0.1)
    }
  })

  // 注册重置缩放快捷键 (Ctrl+0 或 Cmd+0)
  globalShortcut.register('CommandOrControl+0', () => {
    if (mainWindow) {
      mainWindow.webContents.setZoomFactor(1)
    }
  })
}
