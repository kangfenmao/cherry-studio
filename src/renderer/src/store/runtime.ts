import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import Logo from '@renderer/assets/images/logo.png'

export interface RuntimeState {
  avatar: string
  generating: boolean
  minappShow: boolean
}

const initialState: RuntimeState = {
  avatar: Logo,
  generating: false,
  minappShow: false
}

const runtimeSlice = createSlice({
  name: 'runtime',
  initialState,
  reducers: {
    setAvatar: (state, action: PayloadAction<string | null>) => {
      state.avatar = action.payload || Logo
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
