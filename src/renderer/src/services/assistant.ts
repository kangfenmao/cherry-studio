import { Assistant, Provider } from '@renderer/types'
import { getDefaultTopic } from './topic'
import store from '@renderer/store'

export function getDefaultAssistant(): Assistant {
  return {
    id: 'default',
    name: 'Default Assistant',
    description: "Hello, I'm Default Assistant.",
    prompt: '',
    topics: [getDefaultTopic()]
  }
}

export function getAssistantProvider(assistant: Assistant) {
  const providers = store.getState().llm.providers
  return providers.find((p) => p.id === assistant.id) || getDefaultProvider()
}

export function getDefaultProvider() {
  const provider = store.getState().llm.providers.find((p) => p.isSystem)
  return provider as Provider
}
