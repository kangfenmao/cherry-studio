import { Shortcut } from '@types'
import { BrowserWindow, globalShortcut } from 'electron'
import Logger from 'electron-log'

import { configManager } from './ConfigManager'

let showAppAccelerator: string | null = null

function getShortcutHandler(shortcut: Shortcut) {
  switch (shortcut.key) {
    case 'zoom_in':
      return () => handleZoom(0.1)
    case 'zoom_out':
      return () => handleZoom(-0.1)
    case 'zoom_reset':
      return (window: BrowserWindow) => {
        window.webContents.setZoomFactor(1)
        configManager.setZoomFactor(1)
      }
    case 'show_app':
      return (window: BrowserWindow) => {
        if (window.isVisible()) {
          window.hide()
        } else {
          window.show()
          window.focus()
        }
      }
    default:
      return null
  }
}

function formatShortcutKey(shortcut: string[]): string {
  return shortcut.join('+')
}

function handleZoom(delta: number) {
  return (window: BrowserWindow) => {
    const currentZoom = window.webContents.getZoomFactor()
    const newZoom = currentZoom + delta
    if (newZoom >= 0.1 && newZoom <= 5.0) {
      window.webContents.setZoomFactor(newZoom)
      configManager.setZoomFactor(newZoom)
    }
  }
}

function registerWindowShortcuts(window: BrowserWindow) {
  window.webContents.setZoomFactor(configManager.getZoomFactor())

  const register = () => {
    if (window.isDestroyed()) return

    const shortcuts = configManager.getShortcuts()
    if (!shortcuts) return

    shortcuts.forEach((shortcut) => {
      if (!shortcut.enabled || shortcut.shortcut.length === 0) return

      const handler = getShortcutHandler(shortcut)
      if (!handler) return

      const accelerator = formatShortcutKey(shortcut.shortcut)

      if (shortcut.key === 'show_app') {
        showAppAccelerator = accelerator
      }

      Logger.info(`Register shortcut: ${accelerator}`)
      globalShortcut.register(accelerator, () => handler(window))
    })
  }

  const unregister = () => {
    if (window.isDestroyed()) return

    globalShortcut.unregisterAll()

    if (showAppAccelerator) {
      const handler = getShortcutHandler({ key: 'show_app' } as Shortcut)
      if (handler) {
        globalShortcut.register(showAppAccelerator, () => handler(window))
      }
    }
  }

  window.on('focus', () => register())
  window.on('blur', () => unregister())

  if (!window.isDestroyed() && window.isFocused()) {
    register()
  }
}

export function registerShortcuts(mainWindow: BrowserWindow) {
  registerWindowShortcuts(mainWindow)
}

export function unregisterAllShortcuts() {
  showAppAccelerator = null
  globalShortcut.unregisterAll()
}
