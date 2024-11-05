import { BrowserWindow, globalShortcut } from 'electron'

export function registerZoomShortcut(mainWindow: BrowserWindow) {
  const registerShortcuts = () => {
    // 注册放大快捷键 (Ctrl+Plus 或 Cmd+Plus)
    globalShortcut.register('CommandOrControl+=', () => {
      if (mainWindow) {
        const currentZoom = mainWindow.webContents.getZoomFactor()
        const newZoom = currentZoom + 0.1
        // Prevent zoom factor from exceeding reasonable limits
        if (newZoom <= 5.0) {
          mainWindow.webContents.setZoomFactor(newZoom)
        }
      }
    })

    // 注册缩小快捷键 (Ctrl+Minus 或 Cmd+Minus)
    globalShortcut.register('CommandOrControl+-', () => {
      if (mainWindow) {
        const currentZoom = mainWindow.webContents.getZoomFactor()
        const newZoom = currentZoom - 0.1
        // Prevent zoom factor from going below 0.1
        if (newZoom >= 0.1) {
          mainWindow.webContents.setZoomFactor(newZoom)
        }
      }
    })

    // 注册重置缩放快捷键 (Ctrl+0 或 Cmd+0)
    globalShortcut.register('CommandOrControl+0', () => {
      if (mainWindow) {
        mainWindow.webContents.setZoomFactor(1)
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
