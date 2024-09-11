import { Topic } from '@renderer/types'
import { convertToBase64 } from '@renderer/utils'
import localforage from 'localforage'

import { deleteMessageFiles } from './messages'

const IMAGE_PREFIX = 'image://'

export default class LocalStorage {
  static async getTopic(id: string) {
    return localforage.getItem<Topic>(`topic:${id}`)
  }

  static async getTopicMessages(id: string) {
    const topic = await this.getTopic(id)
    return topic ? topic.messages : []
  }

  static async removeTopic(id: string) {
    const messages = await this.getTopicMessages(id)

    for (const message of messages) {
      await deleteMessageFiles(message)
    }

    localforage.removeItem(`topic:${id}`)
  }

  static async clearTopicMessages(id: string) {
    const topic = await this.getTopic(id)

    if (topic) {
      for (const message of topic?.messages ?? []) {
        await deleteMessageFiles(message)
      }

      topic.messages = []
      await localforage.setItem(`topic:${id}`, topic)
    }
  }

  static async storeImage(name: string, file: File) {
    try {
      const base64Image = await convertToBase64(file)
      if (typeof base64Image === 'string') {
        await localforage.setItem(IMAGE_PREFIX + name, base64Image)
      }
    } catch (error) {
      console.error('Error storing the image', error)
    }
  }

  static async getImage(name: string) {
    return localforage.getItem<string>(IMAGE_PREFIX + name)
  }

  static async removeImage(name: string) {
    await localforage.removeItem(IMAGE_PREFIX + name)
  }
}
