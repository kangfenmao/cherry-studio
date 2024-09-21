import db from '@renderer/databases'
import i18n from '@renderer/i18n'
import dayjs from 'dayjs'
import localforage from 'localforage'

export async function backup() {
  const version = 2
  const time = new Date().getTime()

  const data = {
    time,
    version,
    localStorage,
    indexedDB: await backupDatabase()
  }

  const filename = `cherry-studio.${dayjs().format('YYYYMMDD')}.bak`
  const fileContnet = JSON.stringify(data)
  const file = await window.api.compress(fileContnet)

  await window.api.file.save(filename, file)

  window.message.success({ content: i18n.t('message.backup.success'), key: 'backup' })
}

export async function restore() {
  const file = await window.api.file.open()

  if (file) {
    try {
      const content = await window.api.decompress(file.content)
      const data = JSON.parse(content)

      if (data.version === 1) {
        await clearDatabase()

        for (const { key, value } of data.indexedDB) {
          if (key.startsWith('topic:')) {
            await db.table('topics').add({ id: value.id, messages: value.messages })
          }
          if (key === 'image://avatar') {
            await db.table('settings').add({ id: key, value })
          }
        }

        await localStorage.setItem('persist:cherry-studio', data.localStorage['persist:cherry-studio'])
        window.message.success({ content: i18n.t('message.restore.success'), key: 'restore' })
        setTimeout(() => window.api.reload(), 1000)
        return
      }

      if (data.version === 2) {
        localStorage.setItem('persist:cherry-studio', data.localStorage['persist:cherry-studio'])
        await restoreDatabase(data.indexedDB)
        window.message.success({ content: i18n.t('message.restore.success'), key: 'restore' })
        setTimeout(() => window.api.reload(), 1000)
        return
      }

      window.message.error({ content: i18n.t('error.backup.file_format'), key: 'restore' })
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
    centered: true,
    onOk: async () => {
      window.modal.confirm({
        title: i18n.t('message.reset.double.confirm.title'),
        content: i18n.t('message.reset.double.confirm.content'),
        centered: true,
        onOk: async () => {
          await localStorage.clear()
          await localforage.clear()
          await clearDatabase()
          await window.api.file.clear()
          window.api.reload()
        }
      })
    }
  })
}

/************************************* Backup Utils ************************************** */

async function backupDatabase() {
  const tables = db.tables
  const backup = {}

  for (const table of tables) {
    backup[table.name] = await table.toArray()
  }

  return backup
}

async function restoreDatabase(backup: Record<string, any>) {
  await db.transaction('rw', db.tables, async () => {
    for (const tableName in backup) {
      await db.table(tableName).clear()
      await db.table(tableName).bulkAdd(backup[tableName])
    }
  })
}

async function clearDatabase() {
  const storeNames = await db.tables.map((table) => table.name)

  await db.transaction('rw', db.tables, async () => {
    for (const storeName of storeNames) {
      await db[storeName].clear()
    }
  })
}
