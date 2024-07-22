import { useAppDispatch, useAppSelector } from '@renderer/store'
import { toggleRightSidebar, toggleShowAssistants } from '@renderer/store/settings'

export function useShowRightSidebar() {
  const showRightSidebar = useAppSelector((state) => state.settings.showRightSidebar)
  const dispatch = useAppDispatch()

  return {
    showRightSidebar,
    toggleRightSidebar: () => dispatch(toggleRightSidebar())
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
