import { DEFAULT_CONEXTCOUNT } from '@renderer/config/constant'
import { Assistant, Message } from '@renderer/types'
import { isEmpty, takeRight } from 'lodash'

import FileManager from './file'

export const filterMessages = (messages: Message[]) => {
  return messages
    .filter((message) => !['@', 'clear'].includes(message.type!))
    .filter((message) => !isEmpty(message.content.trim()))
}

export function filterContextMessages(messages: Message[]): Message[] {
  const clearIndex = messages.findLastIndex((message) => message.type === 'clear')

  if (clearIndex === -1) {
    return messages
  }

  return messages.slice(clearIndex + 1)
}

export function getContextCount(assistant: Assistant, messages: Message[]) {
  const contextCount = assistant?.settings?.contextCount ?? DEFAULT_CONEXTCOUNT
  const _messages = takeRight(messages, contextCount)
  const clearIndex = _messages.findLastIndex((message) => message.type === 'clear')
  const messagesCount = _messages.length

  if (clearIndex === -1) {
    return contextCount
  }

  return messagesCount - (clearIndex + 1)
}

export function deleteMessageFiles(message: Message) {
  message.files && FileManager.deleteFiles(message.files.map((f) => f.id))
}
