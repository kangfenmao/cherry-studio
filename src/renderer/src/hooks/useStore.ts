import { useAppDispatch, useAppSelector } from '@renderer/store'
import { setShowRightSidebar, toggleRightSidebar, toggleShowAssistants } from '@renderer/store/settings'

export function useShowRightSidebar() {
  const showRightSidebar = useAppSelector((state) => state.settings.showRightSidebar)
  const dispatch = useAppDispatch()

  return {
    rightSidebarShown: showRightSidebar,
    toggleRightSidebar: () => dispatch(toggleRightSidebar()),
    showRightSidebar: () => dispatch(setShowRightSidebar(true)),
    hideRightSidebar: () => dispatch(setShowRightSidebar(false))
  }
}

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
