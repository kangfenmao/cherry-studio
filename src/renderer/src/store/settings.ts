import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type SendMessageShortcut = 'Enter' | 'Shift+Enter'

export interface SettingsState {
  showRightSidebar: boolean
  showAssistants: boolean
  sendMessageShortcut: SendMessageShortcut
  language: string
  proxyUrl?: string
  userName: string
  showMessageDivider: boolean
}

const initialState: SettingsState = {
  showRightSidebar: true,
  showAssistants: true,
  sendMessageShortcut: 'Enter',
  language: navigator.language,
  proxyUrl: undefined,
  userName: '',
  showMessageDivider: true
}

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    toggleRightSidebar: (state) => {
      state.showRightSidebar = !state.showRightSidebar
    },
    toggleShowAssistants: (state) => {
      state.showAssistants = !state.showAssistants
    },
    setSendMessageShortcut: (state, action: PayloadAction<SendMessageShortcut>) => {
      state.sendMessageShortcut = action.payload
    },
    setLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload
    },
    setProxyUrl: (state, action: PayloadAction<string | undefined>) => {
      state.proxyUrl = action.payload
    },
    setUserName: (state, action: PayloadAction<string>) => {
      state.userName = action.payload
    },
    setShowMessageDivider: (state, action: PayloadAction<boolean>) => {
      state.showMessageDivider = action.payload
    }
  }
})

export const {
  toggleRightSidebar,
  toggleShowAssistants,
  setSendMessageShortcut,
  setLanguage,
  setProxyUrl,
  setUserName,
  setShowMessageDivider
} = settingsSlice.actions

export default settingsSlice.reducer
