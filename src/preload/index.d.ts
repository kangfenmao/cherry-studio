import { ElectronAPI } from '@electron-toolkit/preload'
import { FileMetadata } from '@renderer/types'
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
        select: (options?: OpenDialogOptions) => Promise<FileMetadata[] | null>
        upload: (file: FileMetadata) => Promise<FileMetadata>
        delete: (fileId: string) => Promise<{ success: boolean }>
        batchUpload: (files: FileMetadata[]) => Promise<FileMetadata[]>
        batchDelete: (fileIds: string[]) => Promise<{ success: boolean }>
        all: () => Promise<FileMetadata[]>
      }
      image: {
        base64: (filePath: string) => Promise<{ mime: string; base64: string; data: string }>
      }
    }
  }
}
