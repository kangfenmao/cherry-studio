import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Thread } from '@renderer/types'

interface State {
  threads: Thread[]
}

const initialState: State = {
  threads: []
}

const threadsSlice = createSlice({
  name: 'threads',
  initialState,
  reducers: {
    addThread: (state, action: PayloadAction<Thread>) => {
      state.threads.push(action.payload)
    },
    removeThread: (state, action: PayloadAction<{ id: string }>) => {
      state.threads = state.threads.filter((c) => c.id !== action.payload.id)
    },
    updateThread: (state, action: PayloadAction<Thread>) => {
      state.threads = state.threads.map((c) => (c.id === action.payload.id ? action.payload : c))
    }
  }
})

export const { addThread, removeThread, updateThread } = threadsSlice.actions

export default threadsSlice
