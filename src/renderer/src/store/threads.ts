import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Thread } from '@renderer/types'

export interface ThreadsState {
  threads: Thread[]
  activeThread?: Thread
}

const initialState: ThreadsState = {
  threads: [],
  activeThread: undefined
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
      state.activeThread = state.threads[0]
    },
    updateThread: (state, action: PayloadAction<Thread>) => {
      state.threads = state.threads.map((c) => (c.id === action.payload.id ? action.payload : c))
    },
    setActiveThread: (state, action: PayloadAction<Thread>) => {
      state.activeThread = action.payload
    }
  }
})

export const { addThread, removeThread, updateThread, setActiveThread } = threadsSlice.actions

export default threadsSlice.reducer
