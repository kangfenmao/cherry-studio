import fs from 'node:fs'
import path from 'node:path'

import { app } from 'electron'

export function getResourcePath() {
  return path.join(app.getAppPath(), 'resources')
}

export function getDataPath() {
  const dataPath = path.join(app.getPath('userData'), 'Data')
  if (!fs.existsSync(dataPath)) {
    fs.mkdirSync(dataPath, { recursive: true })
  }
  return dataPath
}
