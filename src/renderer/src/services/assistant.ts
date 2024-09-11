import { DEFAULT_CONEXTCOUNT, DEFAULT_MAX_TOKENS, DEFAULT_TEMPERATURE } from '@renderer/config/constant'
import i18n from '@renderer/i18n'
import store from '@renderer/store'
import { updateAgent } from '@renderer/store/agents'
import { updateAssistant } from '@renderer/store/assistants'
import { Agent, Assistant, AssistantSettings, Model, Provider, Topic } from '@renderer/types'
import { getLeadingEmoji, removeLeadingEmoji, uuid } from '@renderer/utils'

export function getDefaultAssistant(): Assistant {
  return {
    id: 'default',
    name: i18n.t('chat.default.name'),
    prompt: '',
    topics: [getDefaultTopic()]
  }
}

export function getDefaultAssistantSettings() {
  return store.getState().assistants.defaultAssistant.settings
}

export function getDefaultTopic(): Topic {
  return {
    id: uuid(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    name: i18n.t('chat.default.topic.name'),
    messages: []
  }
}

export function getDefaultProvider() {
  return getProviderByModel(getDefaultModel())
}

export function getDefaultModel() {
  return store.getState().llm.defaultModel
}

export function getTopNamingModel() {
  return store.getState().llm.topicNamingModel
}

export function getTranslateModel() {
  return store.getState().llm.translateModel
}

export function getAssistantProvider(assistant: Assistant): Provider {
  const providers = store.getState().llm.providers
  const provider = providers.find((p) => p.id === assistant.model?.provider)
  return provider || getDefaultProvider()
}

export function getProviderByModel(model?: Model) {
  const providers = store.getState().llm.providers
  const providerId = model ? model.provider : getDefaultProvider().id
  return providers.find((p) => p.id === providerId) as Provider
}

export function getProviderByModelId(modelId?: string) {
  const providers = store.getState().llm.providers
  const _modelId = modelId || getDefaultModel().id
  return providers.find((p) => p.models.find((m) => m.id === _modelId)) as Provider
}

export const getAssistantSettings = (assistant: Assistant): AssistantSettings => {
  const contextCount = assistant?.settings?.contextCount ?? DEFAULT_CONEXTCOUNT
  const getAssistantMaxTokens = () => {
    if (assistant.settings?.enableMaxTokens) {
      const maxTokens = assistant.settings.maxTokens
      if (typeof maxTokens === 'number') {
        return maxTokens > 100 ? maxTokens : DEFAULT_MAX_TOKENS
      }
      return DEFAULT_MAX_TOKENS
    }
    return undefined
  }

  return {
    contextCount: contextCount === 20 ? 100000 : contextCount,
    temperature: assistant?.settings?.temperature ?? DEFAULT_TEMPERATURE,
    enableMaxTokens: assistant?.settings?.enableMaxTokens ?? false,
    maxTokens: getAssistantMaxTokens()
  }
}

export function covertAgentToAssistant(agent: Agent): Assistant {
  return {
    ...getDefaultAssistant(),
    ...agent,
    id: agent.group === 'system' ? uuid() : String(agent.id),
    name: getAssistantNameWithAgent(agent),
    settings: getDefaultAssistantSettings()
  }
}

export function getAssistantNameWithAgent(agent: Agent) {
  return agent.emoji ? agent.emoji + ' ' + agent.name : agent.name
}

export function syncAsistantToAgent(assistant: Assistant) {
  const agents = store.getState().agents.agents
  const agent = agents.find((a) => a.id === assistant.id)

  if (agent) {
    store.dispatch(
      updateAgent({
        ...agent,
        emoji: getLeadingEmoji(assistant.name),
        name: removeLeadingEmoji(assistant.name),
        prompt: assistant.prompt
      })
    )
  }
}

export function syncAgentToAssistant(agent: Agent) {
  const assistants = store.getState().assistants.assistants
  const assistant = assistants.find((a) => a.id === agent.id)

  if (assistant) {
    store.dispatch(
      updateAssistant({
        ...assistant,
        name: getAssistantNameWithAgent(agent),
        prompt: agent.prompt
      })
    )
  }
}
