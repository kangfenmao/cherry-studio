import { useAppDispatch, useAppSelector } from '@renderer/store'
import { setShowTopics, toggleShowAssistants, toggleShowTopics } from '@renderer/store/settings'

export function useShowAssistants() {
  const showAssistants = useAppSelector((state) => state.settings.showAssistants)
  const dispatch = useAppDispatch()

  return {
    showAssistants,
    toggleShowAssistants: () => dispatch(toggleShowAssistants())
  }
}

export function useShowTopics() {
  const showTopics = useAppSelector((state) => state.settings.showTopics)
  const dispatch = useAppDispatch()

  return {
    showTopics,
    setShowTopics: (show: boolean) => dispatch(setShowTopics(show)),
    toggleShowTopics: () => dispatch(toggleShowTopics())
  }
}

export function useRuntime() {
  return useAppSelector((state) => state.runtime)
}
