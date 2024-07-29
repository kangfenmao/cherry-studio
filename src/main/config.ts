import Store from 'electron-store'

export const appConfig = new Store()

export const titleBarOverlayDark = {
  height: 41,
  color: '#1f1f1f',
  symbolColor: '#ffffff'
}

export const titleBarOverlayLight = {
  height: 41,
  color: '#f8f8f8',
  symbolColor: '#000000'
}
