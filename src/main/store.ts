import { app, ipcMain } from 'electron'
import path from 'path'

const defaultPath = path.join(app.getPath('home'), '.cherry-ai')

export function initStore() {
  ipcMain.on('storage.set', (_, args) => {})
  ipcMain.on('storage.get', (_, args) => {})
  ipcMain.on('storage.delete', (_, args) => {})
  ipcMain.on('storage.clear', (_, args) => {})
}
