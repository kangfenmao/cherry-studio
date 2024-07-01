import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { getDefaultAgent } from '@renderer/services/agent'
import { Agent, Conversation } from '@renderer/types'
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
    addConversation: (state, action: PayloadAction<{ agentId: string; conversation: Conversation }>) => {
      console.debug(action.payload)
      state.agents = state.agents.map((agent) =>
        agent.id === action.payload.agentId
          ? {
              ...agent,
              conversations: uniqBy([action.payload.conversation, ...agent.conversations], 'id')
            }
          : agent
      )
    },
    removeConversation: (state, action: PayloadAction<{ agentId: string; conversation: Conversation }>) => {
      state.agents = state.agents.map((agent) =>
        agent.id === action.payload.agentId
          ? {
              ...agent,
              conversations: agent.conversations.filter(({ id }) => id !== action.payload.conversation.id)
            }
          : agent
      )
    }
  }
})

export const { addAgent, removeAgent, updateAgent, addConversation, removeConversation } = agentsSlice.actions

export default agentsSlice.reducer
