import fs from 'node:fs'

export default class FileService {
  public static async readFile(_: Electron.IpcMainInvokeEvent, path: string) {
    const stats = fs.statSync(path)
    if (stats.isDirectory()) {
      throw new Error(`Cannot read directory: ${path}`)
    }
    return fs.readFileSync(path, 'utf8')
  }
}
