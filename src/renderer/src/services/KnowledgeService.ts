import AiProvider from '@renderer/providers/AiProvider'
import { KnowledgeBase, KnowledgeBaseParams } from '@renderer/types'
import { isEmpty } from 'lodash'

import { getProviderByModel } from './AssistantService'

export const getKnowledgeBaseParams = (base: KnowledgeBase): KnowledgeBaseParams => {
  const provider = getProviderByModel(base.model)
  const aiProvider = new AiProvider(provider)

  if (provider.id === 'ollama' && isEmpty(provider.apiKey)) {
    provider.apiKey = 'empty'
  }

  return {
    id: base.id,
    model: base.model.name,
    apiKey: aiProvider.getApiKey(),
    baseURL: provider.apiHost + '/v1'
  }
}
