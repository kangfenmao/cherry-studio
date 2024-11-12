import { isMac } from '@main/constant'
import { locales } from '@main/utils/locales'
import { app, Menu, nativeImage, nativeTheme, Tray } from 'electron'

import icon from '../../../build/tray_icon.png?asset'
import iconDark from '../../../build/tray_icon_dark.png?asset'
import iconLight from '../../../build/tray_icon_light.png?asset'
import { configManager } from './ConfigManager'
import { windowService } from './WindowService'

export class TrayService {
  private tray: Tray | null = null

  constructor() {
    this.updateTray()
    this.watchTrayChanges()
  }

  private createTray() {
    const iconPath = isMac ? (nativeTheme.shouldUseDarkColors ? iconLight : iconDark) : icon
    const tray = new Tray(iconPath)

    if (process.platform === 'win32') {
      tray.setImage(iconPath)
    } else if (process.platform === 'darwin') {
      const image = nativeImage.createFromPath(iconPath)
      const resizedImage = image.resize({ width: 16, height: 16 })
      resizedImage.setTemplateImage(true)
      tray.setImage(resizedImage)
    } else if (process.platform === 'linux') {
      const image = nativeImage.createFromPath(iconPath)
      const resizedImage = image.resize({ width: 16, height: 16 })
      tray.setImage(resizedImage)
    }

    this.tray = tray

    const locale = locales[configManager.getLanguage()]
    const { tray: trayLocale } = locale.translation

    const contextMenu = Menu.buildFromTemplate([
      {
        label: trayLocale.show_window,
        click: () => windowService.showMainWindow()
      },
      { type: 'separator' },
      {
        label: trayLocale.quit,
        click: () => this.quit()
      }
    ])

    if (process.platform === 'linux') {
      this.tray.setContextMenu(contextMenu)
    }

    this.tray.setToolTip('Cherry Studio')

    this.tray.on('right-click', () => {
      this.tray?.popUpContextMenu(contextMenu)
    })

    this.tray.on('click', () => {
      windowService.showMainWindow()
    })
  }

  private updateTray() {
    if (configManager.isTray()) {
      this.createTray()
    } else {
      this.destroyTray()
    }
  }

  private destroyTray() {
    if (this.tray) {
      this.tray.destroy()
      this.tray = null
    }
  }

  private watchTrayChanges() {
    configManager.subscribe<boolean>('tray', () => this.updateTray())
  }

  private quit() {
    app.quit()
  }
}
