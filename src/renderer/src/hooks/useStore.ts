import { useAppDispatch, useAppSelector } from '@renderer/store'
import { toggleRightSidebar } from '@renderer/store/settings'

export function useShowRightSidebar() {
  const showRightSidebar = useAppSelector((state) => state.settings.showRightSidebar)
  const dispatch = useAppDispatch()

  return {
    showRightSidebar,
    setShowRightSidebar: () => dispatch(toggleRightSidebar())
  }
}
