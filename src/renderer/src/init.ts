import KeyvStorage from '@kangfenmao/keyv-storage'

function init() {
  window.keyv = new KeyvStorage()
  window.keyv.init()
}

init()
