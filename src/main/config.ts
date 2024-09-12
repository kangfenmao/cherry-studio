import fs from 'node:fs'

import { app } from 'electron'
import Store from 'electron-store'
import path from 'path'

export const DATA_PATH = path.join(app.getPath('userData'), 'Data')

if (!fs.existsSync(DATA_PATH)) {
  fs.mkdirSync(DATA_PATH, { recursive: true })
}

export const appConfig = new Store()

export const titleBarOverlayDark = {
  height: 41,
  color: '#00000000',
  symbolColor: '#ffffff'
}

export const titleBarOverlayLight = {
  height: 41,
  color: '#00000000',
  symbolColor: '#000000'
}
