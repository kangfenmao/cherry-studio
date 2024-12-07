import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { isMac } from '@renderer/config/constant'
import { Shortcut } from '@renderer/types'
import { ZOOM_SHORTCUTS } from '@shared/config/constant'

export interface ShortcutsState {
  shortcuts: Shortcut[]
}

const initialState: ShortcutsState = {
  shortcuts: [
    ...ZOOM_SHORTCUTS,
    {
      key: 'new_topic',
      shortcut: [isMac ? 'Command' : 'Ctrl', 'N'],
      editable: true,
      enabled: true
    },
    {
      key: 'show_app',
      shortcut: [],
      editable: true,
      enabled: true
    }
  ]
}

const getSerializableShortcuts = (shortcuts: Shortcut[]) => {
  return shortcuts.map((shortcut) => ({
    key: shortcut.key,
    shortcut: [...shortcut.shortcut],
    enabled: shortcut.enabled
  }))
}

const shortcutsSlice = createSlice({
  name: 'shortcuts',
  initialState,
  reducers: {
    updateShortcut: (state, action: PayloadAction<Shortcut>) => {
      state.shortcuts = state.shortcuts.map((s) => (s.key === action.payload.key ? action.payload : s))
      window.api.shortcuts.update(getSerializableShortcuts(state.shortcuts))
    },
    toggleShortcut: (state, action: PayloadAction<string>) => {
      state.shortcuts = state.shortcuts.map((s) => (s.key === action.payload ? { ...s, enabled: !s.enabled } : s))
      window.api.shortcuts.update(getSerializableShortcuts(state.shortcuts))
    },
    resetShortcuts: (state) => {
      state.shortcuts = initialState.shortcuts
      window.api.shortcuts.update(getSerializableShortcuts(state.shortcuts))
    }
  }
})

export const { updateShortcut, toggleShortcut, resetShortcuts } = shortcutsSlice.actions
export default shortcutsSlice.reducer
export { initialState }
