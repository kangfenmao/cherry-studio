import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Agent } from '@renderer/types'

export interface AgentsState {
  agents: Agent[]
}

const initialState: AgentsState = {
  agents: []
}

const runtimeSlice = createSlice({
  name: 'agents',
  initialState,
  reducers: {
    addAgent: (state, action: PayloadAction<Agent>) => {
      state.agents.push(action.payload)
    },
    removeAgent: (state, action: PayloadAction<Agent>) => {
      state.agents = state.agents.filter((a) => a.id !== action.payload.id)
    },
    updateAgent: (state, action: PayloadAction<Agent>) => {
      state.agents = state.agents.map((a) => (a.id === action.payload.id ? action.payload : a))
    },
    updateAgents: (state, action: PayloadAction<Agent[]>) => {
      state.agents = action.payload
    }
  }
})

export const { addAgent, removeAgent, updateAgent, updateAgents } = runtimeSlice.actions

export default runtimeSlice.reducer
