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
  messageFont: 'system' | 'serif'
}

const initialState: SettingsState = {
  showRightSidebar: true,
  showAssistants: true,
  sendMessageShortcut: 'Enter',
  language: navigator.language,
  proxyUrl: undefined,
  userName: '',
  showMessageDivider: true,
  messageFont: 'system'
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
    },
    setMessageFont: (state, action: PayloadAction<'system' | 'serif'>) => {
      state.messageFont = action.payload
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
  setShowMessageDivider,
  setMessageFont
} = settingsSlice.actions

export default settingsSlice.reducer
