import { Topic } from '@renderer/types'
import localforage from 'localforage'

export default class LocalStorage {
  static async getTopicMessages(id: string) {
    const topic = await localforage.getItem<Topic>(`topic:${id}`)
    return topic ? topic.messages : []
  }

  static async removeTopic(id: string) {
    localforage.removeItem(`topic:${id}`)
  }
}
