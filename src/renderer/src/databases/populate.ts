import i18n from '@renderer/i18n'
import { Transaction } from 'dexie'
import localforage from 'localforage'

export async function populateTopics(trans: Transaction) {
  const indexedKeys = await localforage.keys()

  if (indexedKeys.length > 0) {
    for (const key of indexedKeys) {
      const value: any = await localforage.getItem(key)
      if (key.startsWith('topic:')) {
        await trans.db.table('topics').add({ id: value.id, messages: value.messages })
      }
      if (key === 'image://avatar') {
        await trans.db.table('settings').add({ id: key, value: await localforage.getItem(key) })
      }
    }

    window.modal.success({
      title: i18n.t('message.upgrade.success.title'),
      content: i18n.t('message.upgrade.success.content'),
      okText: i18n.t('message.upgrade.success.button'),
      centered: true,
      onOk: () => window.api.reload()
    })
  }
}
