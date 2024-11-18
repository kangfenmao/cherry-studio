import { BrowserWindow, globalShortcut } from 'electron'

import { configManager } from './ConfigManager'

export function registerZoomShortcut(mainWindow: BrowserWindow) {
  // 初始化缩放值
  const initialZoom = configManager.getZoomFactor()
  mainWindow.webContents.setZoomFactor(initialZoom)

  const registerShortcuts = () => {
    globalShortcut.register('CommandOrControl+=', () => {
      if (mainWindow) {
        const currentZoom = mainWindow.webContents.getZoomFactor()
        const newZoom = currentZoom + 0.1
        if (newZoom <= 5.0) {
          mainWindow.webContents.setZoomFactor(newZoom)
          configManager.setZoomFactor(newZoom) // 保存新的缩放值
        }
      }
    })

    globalShortcut.register('CommandOrControl+-', () => {
      if (mainWindow) {
        const currentZoom = mainWindow.webContents.getZoomFactor()
        const newZoom = currentZoom - 0.1
        if (newZoom >= 0.1) {
          mainWindow.webContents.setZoomFactor(newZoom)
          configManager.setZoomFactor(newZoom) // 保存新的缩放值
        }
      }
    })

    globalShortcut.register('CommandOrControl+0', () => {
      if (mainWindow) {
        mainWindow.webContents.setZoomFactor(1)
        configManager.setZoomFactor(1) // 保存默认缩放值
      }
    })
  }

  const unregisterShortcuts = () => {
    globalShortcut.unregister('CommandOrControl+=')
    globalShortcut.unregister('CommandOrControl+-')
    globalShortcut.unregister('CommandOrControl+0')
  }

  // Add check for window destruction
  if (mainWindow.isDestroyed()) {
    return
  }

  // When window gains focus, register shortcuts
  mainWindow.on('focus', () => {
    if (!mainWindow.isDestroyed()) {
      registerShortcuts()
    }
  })

  // When window loses focus, unregister shortcuts
  mainWindow.on('blur', () => {
    if (!mainWindow.isDestroyed()) {
      unregisterShortcuts()
    }
  })

  // Initial registration (if window is already focused)
  if (!mainWindow.isDestroyed() && mainWindow.isFocused()) {
    registerShortcuts()
  }
}
