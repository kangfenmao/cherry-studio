import { dialog, OpenDialogOptions, OpenDialogReturnValue, SaveDialogOptions, SaveDialogReturnValue } from 'electron'
import logger from 'electron-log'
import { writeFile } from 'fs'
import { readFile } from 'fs/promises'

export async function saveFile(
  _: Electron.IpcMainInvokeEvent,
  fileName: string,
  content: string,
  options?: SaveDialogOptions
): Promise<void> {
  try {
    const result: SaveDialogReturnValue = await dialog.showSaveDialog({
      title: '保存文件',
      defaultPath: fileName,
      ...options
    })

    if (!result.canceled && result.filePath) {
      writeFile(result.filePath, content, { encoding: 'utf-8' }, (err) => {
        if (err) {
          logger.error('[IPC - Error]', 'An error occurred saving the file:', err)
        }
      })
    }
  } catch (err) {
    logger.error('[IPC - Error]', 'An error occurred saving the file:', err)
  }
}

export async function openFile(
  _: Electron.IpcMainInvokeEvent,
  options: OpenDialogOptions
): Promise<{ fileName: string; content: Buffer } | null> {
  try {
    const result: OpenDialogReturnValue = await dialog.showOpenDialog({
      title: '打开文件',
      properties: ['openFile'],
      filters: [{ name: '所有文件', extensions: ['*'] }],
      ...options
    })

    if (!result.canceled && result.filePaths.length > 0) {
      const filePath = result.filePaths[0]
      const fileName = filePath.split('/').pop() || ''
      const content = await readFile(filePath)
      return { fileName, content }
    }

    return null
  } catch (err) {
    logger.error('[IPC - Error]', 'An error occurred opening the file:', err)
    return null
  }
}
