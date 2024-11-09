import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AppLogo, UserAvatar } from '@renderer/config/env'

export interface RuntimeState {
  avatar: string
  generating: boolean
  minappShow: boolean
  searching: boolean
  filesPath: string
}

const initialState: RuntimeState = {
  avatar: UserAvatar,
  generating: false,
  minappShow: false,
  searching: false,
  filesPath: ''
}

const runtimeSlice = createSlice({
  name: 'runtime',
  initialState,
  reducers: {
    setAvatar: (state, action: PayloadAction<string | null>) => {
      state.avatar = action.payload || AppLogo
    },
    setGenerating: (state, action: PayloadAction<boolean>) => {
      state.generating = action.payload
      if (!state.generating) {
        const mermaidElements = document.querySelectorAll('.mermaid')
        for (const element of mermaidElements) {
          if (!element.querySelector('svg')) {
            element.removeAttribute('data-processed')
          }
        }
        setTimeout(() => window.mermaid.contentLoaded(), 100)
      }
    },
    setMinappShow: (state, action: PayloadAction<boolean>) => {
      state.minappShow = action.payload
    },
    setSearching: (state, action: PayloadAction<boolean>) => {
      state.searching = action.payload
    },
    setFilesPath: (state, action: PayloadAction<string>) => {
      state.filesPath = action.payload
    }
  }
})

export const { setAvatar, setGenerating, setMinappShow, setSearching, setFilesPath } = runtimeSlice.actions

export default runtimeSlice.reducer
