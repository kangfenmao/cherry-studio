import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AppLogo } from '@renderer/config/env'

export interface RuntimeState {
  avatar: string
  generating: boolean
  minappShow: boolean
}

const initialState: RuntimeState = {
  avatar: AppLogo,
  generating: false,
  minappShow: false
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
    },
    setMinappShow: (state, action: PayloadAction<boolean>) => {
      state.minappShow = action.payload
    }
  }
})

export const { setAvatar, setGenerating, setMinappShow } = runtimeSlice.actions

export default runtimeSlice.reducer
