import AiProvider from '@renderer/providers/AiProvider'
import { KnowledgeBase, RagAppRequestParams } from '@renderer/types'

import { getProviderByModel } from './AssistantService'

export const getRagAppRequestParams = (base: KnowledgeBase): RagAppRequestParams => {
  const provider = getProviderByModel(base.model)
  const aiProvider = new AiProvider(provider)

  return {
    id: base.id,
    model: base.model.name,
    apiKey: aiProvider.getApiKey(),
    baseURL: provider.apiHost + '/v1'
  }
}
