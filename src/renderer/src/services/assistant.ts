import { Assistant } from '@renderer/types'
import { getDefaultTopic } from './topic'

export function getDefaultAssistant(): Assistant {
  return {
    id: 'default',
    name: 'Default Assistant',
    description: "Hello, I'm Default Assistant.",
    prompt: '',
    topics: [getDefaultTopic()]
  }
}
