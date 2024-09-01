import { useProviders } from './useProvider'

export function useModel(id?: string) {
  const { providers } = useProviders()
  const allModels = providers.map((p) => p.models).flat()
  return allModels.find((m) => m.id === id)
}
