import { createSlice } from '@reduxjs/toolkit'

type Provider = {
  id: string
  name: string
  apiKey: string
  apiUrl: string
  url: string
}

export interface LlmState {
  providers: Provider[]
}

const initialState: LlmState = {
  providers: []
}

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    updateProvider: () => {
      //
    }
  }
})

export const { updateProvider } = settingsSlice.actions

export default settingsSlice.reducer
