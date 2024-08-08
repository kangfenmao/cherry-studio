import { Assistant, Message } from '@renderer/types'
import { GPTTokens } from 'gpt-tokens'
import { isEmpty, takeRight } from 'lodash'

import { getAssistantSettings } from './assistant'

export const filterMessages = (messages: Message[]) => {
  return messages.filter((message) => message.type !== '@').filter((message) => !isEmpty(message.content.trim()))
}

export function estimateInputTokenCount(text: string) {
  const input = new GPTTokens({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: text }]
  })

  return input.usedTokens - 7
}

export function estimateHistoryTokenCount(assistant: Assistant, msgs: Message[]) {
  const { contextCount } = getAssistantSettings(assistant)

  const all = new GPTTokens({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: assistant.prompt },
      ...filterMessages(takeRight(msgs, contextCount)).map((message) => ({
        role: message.role,
        content: message.content
      }))
    ]
  })

  return all.usedTokens - 7
}
