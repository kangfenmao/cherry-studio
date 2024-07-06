import { useAppDispatch, useAppSelector } from '@renderer/store'
import { setSendMessageShortcut as _setSendMessageShortcut, SendMessageShortcut } from '@renderer/store/settings'

export function useSettings() {
  const settings = useAppSelector((state) => state.settings)
  const dispatch = useAppDispatch()

  return {
    ...settings,
    setSendMessageShortcut(shortcut: SendMessageShortcut) {
      dispatch(_setSendMessageShortcut(shortcut))
    }
  }
}
