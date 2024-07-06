import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type SendMessageShortcut = 'Enter' | 'Shift+Enter'

export interface SettingsState {
  showRightSidebar: boolean
  sendMessageShortcut: SendMessageShortcut
}

const initialState: SettingsState = {
  showRightSidebar: true,
  sendMessageShortcut: 'Enter'
}

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    toggleRightSidebar: (state) => {
      state.showRightSidebar = !state.showRightSidebar
    },
    setSendMessageShortcut: (state, action: PayloadAction<SendMessageShortcut>) => {
      state.sendMessageShortcut = action.payload
    }
  }
})

export const { toggleRightSidebar, setSendMessageShortcut } = settingsSlice.actions

export default settingsSlice.reducer
