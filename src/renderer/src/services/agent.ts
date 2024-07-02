import { DEFAULT_TOPIC_NAME } from '@renderer/config/constant'
import { Agent } from '@renderer/types'
import { uuid } from '@renderer/utils'

export function getDefaultAgent(): Agent {
  return {
    id: 'default',
    name: 'Default Agent',
    description: "Hello, I'm Default Agent.",
    topics: [
      {
        id: uuid(),
        name: DEFAULT_TOPIC_NAME,
        messages: []
      }
    ]
  }
}
