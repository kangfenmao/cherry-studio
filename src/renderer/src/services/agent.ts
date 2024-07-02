import { Agent } from '@renderer/types'
import { getDefaultTopic } from './topic'

export function getDefaultAgent(): Agent {
  return {
    id: 'default',
    name: 'Default Agent',
    description: "Hello, I'm Default Agent.",
    prompt: '',
    topics: [getDefaultTopic()]
  }
}
