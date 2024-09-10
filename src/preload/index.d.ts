import { ElectronAPI } from '@electron-toolkit/preload'
import type { OpenDialogOptions } from 'electron'

import type FileMetadata from '../main/file'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      getAppInfo: () => Promise<{
        version: string
        isPackaged: boolean
        appPath: string
      }>
      checkForUpdate: () => void
      openWebsite: (url: string) => void
      setProxy: (proxy: string | undefined) => void
      saveFile: (path: string, content: string | NodeJS.ArrayBufferView, options?: SaveDialogOptions) => void
      openFile: (options?: OpenDialogOptions) => Promise<{ fileName: string; content: Buffer } | null>
      setTheme: (theme: 'light' | 'dark') => void
      minApp: (options: { url: string; windowOptions?: Electron.BrowserWindowConstructorOptions }) => void
      reload: () => void
      compress: (text: string) => Promise<Buffer>
      decompress: (text: Buffer) => Promise<string>
      fileSelect: (options?: OpenDialogOptions) => Promise<FileMetadata[] | null>
      fileUpload: (filePath: string) => Promise<FileMetadata>
      fileDelete: (fileId: string) => Promise<{ success: boolean }>
      fileBatchUpload: (filePaths: string[]) => Promise<FileMetadata[]>
      fileBatchDelete: (fileIds: string[]) => Promise<{ success: boolean }>
    }
  }
}
