import i18n from '@renderer/i18n'
import dayjs from 'dayjs'
import localforage from 'localforage'

export async function backup() {
  const indexedKeys = await localforage.keys()
  const version = 1
  const time = new Date().getTime()

  const data = {
    time,
    version,
    localStorage,
    indexedDB: [] as { key: string; value: any }[]
  }

  for (const key of indexedKeys) {
    data.indexedDB.push({
      key,
      value: await localforage.getItem(key)
    })
  }

  const filename = `cherry-studio.${dayjs().format('YYYYMMDD')}.bak`
  const fileContnet = JSON.stringify(data)
  const file = await window.api.compress(fileContnet)

  window.api.saveFile(filename, file)
}

export async function restore() {
  const file = await window.api.openFile()

  if (file) {
    try {
      const content = await window.api.decompress(file.content)
      const data = JSON.parse(content)

      if (data.version === 1) {
        localStorage.setItem('persist:cherry-studio', data.localStorage['persist:cherry-studio'])

        for (const { key, value } of data.indexedDB) {
          await localforage.setItem(key, value)
        }

        window.message.success({ content: i18n.t('message.restore.success'), key: 'restore' })
        setTimeout(() => window.api.reload(), 1500)
      } else {
        window.message.error({ content: i18n.t('error.backup.file_format'), key: 'restore' })
      }
    } catch (error) {
      console.error(error)
      window.message.error({ content: i18n.t('error.backup.file_format'), key: 'restore' })
    }
  }
}

export async function reset() {
  window.modal.confirm({
    title: i18n.t('common.warning'),
    content: i18n.t('message.reset.confirm.content'),
    onOk: async () => {
      window.modal.confirm({
        title: i18n.t('message.reset.double.confirm.title'),
        content: i18n.t('message.reset.double.confirm.content'),
        centered: true,
        onOk: async () => {
          await localStorage.clear()
          await localforage.clear()
          window.api.reload()
        }
      })
    }
  })
}
