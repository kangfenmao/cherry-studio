import localforage from 'localforage'
import KeyvStorage from '@kangfenmao/keyv-storage'
import * as Sentry from '@sentry/electron/renderer'
import { isProduction, loadScript } from './utils'
import { ThemeMode } from './store/settings'

async function initSentry() {
  if (await isProduction()) {
    Sentry.init({
      integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration()],

      // Set tracesSampleRate to 1.0 to capture 100%
      // of transactions for performance monitoring.
      // We recommend adjusting this value in production
      tracesSampleRate: 1.0,

      // Capture Replay for 10% of all sessions,
      // plus for 100% of sessions with an error
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0
    })
  }
}

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
    description: 'Cherry Studio Storage'
  })

  window.keyv = new KeyvStorage()
  window.keyv.init()

  initSentry()
}

init()
