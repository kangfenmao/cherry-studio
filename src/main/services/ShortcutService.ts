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

  // 当窗口获得焦点时注册快捷键
  mainWindow.on('focus', registerShortcuts)

  // 当窗口失去焦点时注销快捷键
  mainWindow.on('blur', unregisterShortcuts)

  // 初始注册（如果窗口已经处于焦点状态）
  if (mainWindow.isFocused()) {
    registerShortcuts()
  }
}
