import { useAppDispatch, useAppSelector } from '@renderer/store'
import { toggleShowAssistants } from '@renderer/store/settings'

export function useShowAssistants() {
  const showAssistants = useAppSelector((state) => state.settings.showAssistants)
  const dispatch = useAppDispatch()

  return {
    showAssistants,
    toggleShowAssistants: () => dispatch(toggleShowAssistants())
  }
}

export function useRuntime() {
  return useAppSelector((state) => state.runtime)
}
