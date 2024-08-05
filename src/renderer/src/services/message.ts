import { Message } from '@renderer/types'

export const filterAtMessages = (messages: Message[]) => {
  return messages.filter((message) => message.type !== '@')
}
