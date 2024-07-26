import { dialog, SaveDialogOptions, SaveDialogReturnValue } from 'electron'
import { writeFile } from 'fs'
import logger from 'electron-log'

export async function saveFile(_: Electron.IpcMainInvokeEvent, fileName: string, content: string): Promise<void> {
  try {
    const options: SaveDialogOptions = {
      title: '保存文件',
      defaultPath: fileName
    }

    const result: SaveDialogReturnValue = await dialog.showSaveDialog(options)

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
