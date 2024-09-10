import { electronAPI } from '@electron-toolkit/preload'
import { contextBridge, ipcRenderer, OpenDialogOptions } from 'electron'

// Custom APIs for renderer
const api = {
  getAppInfo: () => ipcRenderer.invoke('get-app-info'),
  checkForUpdate: () => ipcRenderer.invoke('check-for-update'),
  openWebsite: (url: string) => ipcRenderer.invoke('open-website', url),
  setProxy: (proxy: string) => ipcRenderer.invoke('set-proxy', proxy),
  setTheme: (theme: 'light' | 'dark') => ipcRenderer.invoke('set-theme', theme),
  minApp: (url: string) => ipcRenderer.invoke('minapp', url),
  openFile: (options?: { decompress: boolean }) => ipcRenderer.invoke('open-file', options),
  reload: () => ipcRenderer.invoke('reload'),
  saveFile: (path: string, content: string, options?: { compress: boolean }) => {
    ipcRenderer.invoke('save-file', path, content, options)
  },
  compress: (text: string) => ipcRenderer.invoke('zip:compress', text),
  decompress: (text: Buffer) => ipcRenderer.invoke('zip:decompress', text),
  fileSelect: (options?: OpenDialogOptions) => ipcRenderer.invoke('file:select', options),
  fileUpload: (filePath: string) => ipcRenderer.invoke('file:upload', filePath),
  fileDelete: (fileId: string) => ipcRenderer.invoke('file:delete', fileId),
  fileBatchUpload: (filePaths: string[]) => ipcRenderer.invoke('file:batchUpload', filePaths),
  fileBatchDelete: (fileIds: string[]) => ipcRenderer.invoke('file:batchDelete', fileIds),
  fileGetAll: () => ipcRenderer.invoke('file:getAll')
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
