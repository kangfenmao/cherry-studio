import { ElectronAPI } from '@electron-toolkit/preload'
import { FileType } from '@renderer/types'
import type { OpenDialogOptions } from 'electron'

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
      file: {
        select: (options?: OpenDialogOptions) => Promise<FileType[] | null>
        upload: (file: FileType) => Promise<FileType>
        delete: (fileId: string) => Promise<{ success: boolean }>
      }
      image: {
        base64: (filePath: string) => Promise<{ mime: string; base64: string; data: string }>
      }
    }
  }
}
