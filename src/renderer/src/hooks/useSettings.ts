import { useAppDispatch, useAppSelector } from '@renderer/store'
import {
  SendMessageShortcut,
  setSendMessageShortcut as _setSendMessageShortcut,
  setTheme,
  setTopicPosition,
  setWindowStyle,
  ThemeMode
} from '@renderer/store/settings'

export function useSettings() {
  const settings = useAppSelector((state) => state.settings)
  const dispatch = useAppDispatch()

  return {
    ...settings,
    setSendMessageShortcut(shortcut: SendMessageShortcut) {
      dispatch(_setSendMessageShortcut(shortcut))
    },
    setTheme(theme: ThemeMode) {
      dispatch(setTheme(theme))
    },
    setWindowStyle(windowStyle: 'transparent' | 'opaque') {
      dispatch(setWindowStyle(windowStyle))
    },
    setTopicPosition(topicPosition: 'left' | 'right') {
      dispatch(setTopicPosition(topicPosition))
    }
  }
}
