import { useAppDispatch, useAppSelector } from '@renderer/store'
import {
  addModel as _addModel,
  removeModel as _removeModel,
  updateProvider as _updateProvider
} from '@renderer/store/llm'
import { Assistant, Model, Provider } from '@renderer/types'
import { useDefaultModel } from './useAssistant'

export function useProviders() {
  return useAppSelector((state) => state.llm.providers)
}

export function useProvider(id: string) {
  const provider = useAppSelector((state) => state.llm.providers.find((p) => p.id === id) as Provider)
  const dispatch = useAppDispatch()

  return {
    provider,
    models: provider.models,
    updateProvider: (provider: Provider) => dispatch(_updateProvider(provider)),
    addModel: (model: Model) => dispatch(_addModel({ providerId: id, model })),
    removeModel: (model: Model) => dispatch(_removeModel({ providerId: id, model }))
  }
}

export function useProviderByAssistant(assistant: Assistant) {
  const { defaultModel } = useDefaultModel()
  const model = assistant.model || defaultModel
  const { provider } = useProvider(model.provider)
  return provider
}

export function useSystemProviders() {
  return useAppSelector((state) => state.llm.providers.filter((p) => p.isSystem)) as unknown as Provider
}
