import localforage from 'localforage'
import KeyvStorage from '@kangfenmao/keyv-storage'

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
}

init()
