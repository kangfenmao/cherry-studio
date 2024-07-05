import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import Logo from '@renderer/assets/images/logo.png'

export interface RuntimeState {
  avatar: string
}

const initialState: RuntimeState = {
  avatar: Logo
}

const runtimeSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setAvatar: (state, action: PayloadAction<string | null>) => {
      state.avatar = action.payload || Logo
    }
  }
})

export const { setAvatar } = runtimeSlice.actions

export default runtimeSlice.reducer
