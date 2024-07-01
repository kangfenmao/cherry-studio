import { createSlice } from '@reduxjs/toolkit'

export interface SettingsState {
  showRightSidebar: boolean
}

const initialState: SettingsState = {
  showRightSidebar: false
}

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    toggleRightSidebar: (state) => {
      state.showRightSidebar = !state.showRightSidebar
    }
  }
})

export const { toggleRightSidebar } = settingsSlice.actions

export default settingsSlice.reducer
