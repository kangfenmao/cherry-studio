import path from 'node:path'

import { app } from 'electron'

export function getResourcePath() {
  return path.join(app.getAppPath(), 'resources')
}
