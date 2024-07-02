import { Topic } from '@renderer/types'
import localforage from 'localforage'

export default class LocalStorage {
  static async getTopic(id: string) {
    return localforage.getItem<Topic>(`topic:${id}`)
  }
  static async getTopicMessages(id: string) {
    const topic = await this.getTopic(id)
    return topic ? topic.messages : []
  }

  static async removeTopic(id: string) {
    localforage.removeItem(`topic:${id}`)
  }

  static async clearTopicMessages(id: string) {
    const topic = await this.getTopic(id)
    if (topic) {
      topic.messages = []
      await localforage.setItem(`topic:${id}`, topic)
    }
  }
}
