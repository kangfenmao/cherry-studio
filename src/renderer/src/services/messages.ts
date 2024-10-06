import { DEFAULT_CONEXTCOUNT } from '@renderer/config/constant'
import { getTopicById } from '@renderer/hooks/useTopic'
import { Assistant, Message } from '@renderer/types'
import { isEmpty, takeRight } from 'lodash'
import { NavigateFunction } from 'react-router'

import { getAssistantById } from './assistant'
import { EVENT_NAMES, EventEmitter } from './event'
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

export async function locateToMessage(navigate: NavigateFunction, message: Message) {
  const assistant = getAssistantById(message.assistantId)
  const topic = await getTopicById(message.topicId)
  navigate('/', { state: { assistant, topic } })
  setTimeout(() => EventEmitter.emit(EVENT_NAMES.SHOW_TOPIC_SIDEBAR), 0)
  setTimeout(() => EventEmitter.emit(EVENT_NAMES.LOCATE_MESSAGE + ':' + message.id), 300)
}
