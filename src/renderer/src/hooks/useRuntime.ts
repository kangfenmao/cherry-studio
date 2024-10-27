import { useAppSelector } from '@renderer/store'

export function useRuntime() {
  return useAppSelector((state) => state.runtime)
}
