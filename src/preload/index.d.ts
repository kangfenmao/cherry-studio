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
      setTheme: (theme: 'light' | 'dark') => void
      minApp: (options: { url: string; windowOptions?: Electron.BrowserWindowConstructorOptions }) => void
      reload: () => void
      compress: (text: string) => Promise<Buffer>
      decompress: (text: Buffer) => Promise<string>
      file: {
        select: (options?: OpenDialogOptions) => Promise<FileType[] | null>
        upload: (file: FileType) => Promise<FileType>
        delete: (fileId: string) => Promise<void>
        read: (fileId: string) => Promise<string>
        base64Image: (fileId: string) => Promise<{ mime: string; base64: string; data: string }>
        clear: () => Promise<void>
        get: (filePath: string) => Promise<FileType | null>
        create: (fileName: string) => Promise<string>
        write: (filePath: string, data: Uint8Array | string) => Promise<void>
        open: (options?: OpenDialogOptions) => Promise<{ fileName: string; content: Buffer } | null>
        save: (path: string, content: string | NodeJS.ArrayBufferView, options?: SaveDialogOptions) => void
        saveImage: (name: string, data: string) => void
      }
    }
  }
}
