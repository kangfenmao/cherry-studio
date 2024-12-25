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

  let host = aiProvider.getBaseURL()

  if (host.includes('generativelanguage.googleapis.com')) {
    host = host + '/v1beta/openai/'
  }

  return {
    id: base.id,
    model: base.model.id,
    dimensions: base.dimensions,
    apiKey: aiProvider.getApiKey(),
    baseURL: host
  }
}
