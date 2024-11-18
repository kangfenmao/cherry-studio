import { BrowserWindow, globalShortcut } from 'electron'

import { configManager } from './ConfigManager'

export function registerZoomShortcut(mainWindow: BrowserWindow) {
  // 初始化缩放值
  const initialZoom = configManager.getZoomFactor()
  mainWindow.webContents.setZoomFactor(initialZoom)

  const handleZoom = (delta: number) => {
    if (mainWindow) {
      const currentZoom = mainWindow.webContents.getZoomFactor()
      const newZoom = currentZoom + delta
      if (newZoom >= 0.1 && newZoom <= 5.0) {
        mainWindow.webContents.setZoomFactor(newZoom)
        configManager.setZoomFactor(newZoom)
      }
    }
  }

  const registerShortcuts = () => {
    // 放大快捷键
    globalShortcut.register('CommandOrControl+=', () => handleZoom(0.1))
    globalShortcut.register('CommandOrControl+numadd', () => handleZoom(0.1))

    // 缩小快捷键
    globalShortcut.register('CommandOrControl+-', () => handleZoom(-0.1))
    globalShortcut.register('CommandOrControl+numsub', () => handleZoom(-0.1))

    // 重置快捷键
    globalShortcut.register('CommandOrControl+0', () => {
      if (mainWindow) {
        mainWindow.webContents.setZoomFactor(1)
        configManager.setZoomFactor(1)
      }
    })
  }

  const unregisterShortcuts = () => {
    globalShortcut.unregister('CommandOrControl+=')
    globalShortcut.unregister('CommandOrControl+numadd')
    globalShortcut.unregister('CommandOrControl+-')
    globalShortcut.unregister('CommandOrControl+numsub')
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
