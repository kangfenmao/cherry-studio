import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { getDefaultAgent } from '@renderer/services/agent'
import { Agent, Topic } from '@renderer/types'
import { uniqBy } from 'lodash'

export interface AgentsState {
  agents: Agent[]
}

const initialState: AgentsState = {
  agents: [getDefaultAgent()]
}

const agentsSlice = createSlice({
  name: 'agents',
  initialState,
  reducers: {
    addAgent: (state, action: PayloadAction<Agent>) => {
      state.agents.push(action.payload)
    },
    removeAgent: (state, action: PayloadAction<{ id: string }>) => {
      state.agents = state.agents.filter((c) => c.id !== action.payload.id)
    },
    updateAgent: (state, action: PayloadAction<Agent>) => {
      state.agents = state.agents.map((c) => (c.id === action.payload.id ? action.payload : c))
    },
    addTopic: (state, action: PayloadAction<{ agentId: string; topic: Topic }>) => {
      console.debug(action.payload)
      state.agents = state.agents.map((agent) =>
        agent.id === action.payload.agentId
          ? {
              ...agent,
              topics: uniqBy([action.payload.topic, ...agent.topics], 'id')
            }
          : agent
      )
    },
    removeTopic: (state, action: PayloadAction<{ agentId: string; topic: Topic }>) => {
      state.agents = state.agents.map((agent) =>
        agent.id === action.payload.agentId
          ? {
              ...agent,
              topics: agent.topics.filter(({ id }) => id !== action.payload.topic.id)
            }
          : agent
      )
    }
  }
})

export const { addAgent, removeAgent, updateAgent, addTopic, removeTopic } = agentsSlice.actions

export default agentsSlice.reducer
