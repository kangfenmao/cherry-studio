import { electronApp, optimizer } from '@electron-toolkit/utils'
import * as Sentry from '@sentry/electron/main'
import { app, BrowserWindow } from 'electron'
import installExtension, { REDUX_DEVTOOLS } from 'electron-devtools-installer'

import { registerIpc } from './ipc'
import { updateUserDataPath } from './utils/upgrade'
import { createMainWindow } from './window'

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
  await updateUserDataPath()

  // Set app user model id for windows
  electronApp.setAppUserModelId('com.kangfenmao.CherryStudio')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
  })

  const mainWindow = createMainWindow()

  registerIpc(mainWindow, app)

  installExtension(REDUX_DEVTOOLS)
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
Sentry.init({
  dsn: 'https://f0e972deff79c2df3e887e232d8a46a3@o4507610668007424.ingest.us.sentry.io/4507610670563328'
})
