import KeyvStorage from '@kangfenmao/keyv-storage'
import localforage from 'localforage'

import { APP_NAME } from './config/env'
import { ThemeMode } from './types'
import { loadScript } from './utils'

export async function initMermaid(theme: ThemeMode) {
  if (!window.mermaid) {
    await loadScript('https://unpkg.com/mermaid@10.9.1/dist/mermaid.min.js')
    window.mermaid.initialize({
      startOnLoad: true,
      theme: theme === ThemeMode.dark ? 'dark' : 'default',
      securityLevel: 'loose'
    })
    window.mermaid.contentLoaded()
  }
}

function init() {
  localforage.config({
    driver: localforage.INDEXEDDB,
    name: 'CherryAI',
    version: 1.0,
    storeName: 'cherryai',
    description: `${APP_NAME} Storage`
  })

  window.keyv = new KeyvStorage()
  window.keyv.init()
}

init()
