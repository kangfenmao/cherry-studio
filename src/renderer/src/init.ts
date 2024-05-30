import localforage from 'localforage'

function init() {
  localforage.config({
    driver: localforage.INDEXEDDB,
    name: 'CherryAI',
    version: 1.0,
    storeName: 'cherryai',
    description: 'Cherry AI storage'
  })
}

init()
