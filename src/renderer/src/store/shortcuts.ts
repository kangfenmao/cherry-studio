import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { isMac } from '@renderer/config/constant'
import { Shortcut } from '@renderer/types'

export interface ShortcutsState {
  shortcuts: Shortcut[]
}

const initialState: ShortcutsState = {
  shortcuts: [
    {
      key: 'new_topic',
      name: 'settings.shortcuts.new_topic',
      shortcut: [isMac ? 'Command' : 'Ctrl', 'N'],
      enabled: true
    },
    {
      key: 'zoom_in',
      name: 'settings.shortcuts.zoom_in',
      shortcut: [isMac ? 'Command' : 'Ctrl', '='],
      enabled: true
    },
    {
      key: 'zoom_out',
      name: 'settings.shortcuts.zoom_out',
      shortcut: [isMac ? 'Command' : 'Ctrl', '-'],
      enabled: true
    },
    {
      key: 'zoom_reset',
      name: 'settings.shortcuts.zoom_reset',
      shortcut: [isMac ? 'Command' : 'Ctrl', '0'],
      enabled: true
    },
    {
      key: 'show_app',
      name: 'settings.shortcuts.show_app',
      shortcut: [isMac ? 'Command' : 'Ctrl', 'Shift', 'A'],
      enabled: true
    }
  ]
}

const getSerializableShortcuts = (shortcuts: Shortcut[]) => {
  return shortcuts.map((shortcut) => ({
    key: shortcut.key,
    name: shortcut.name,
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
