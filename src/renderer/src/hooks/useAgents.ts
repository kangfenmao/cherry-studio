import { useAppDispatch, useAppSelector } from '@renderer/store'
import {
  addConversation as _addConversation,
  removeConversation as _removeConversation,
  addAgent,
  removeAgent,
  updateAgent
} from '@renderer/store/agents'
import { Agent, Conversation } from '@renderer/types'
import localforage from 'localforage'

export default function useAgents() {
  const { agents } = useAppSelector((state) => state.agents)
  const dispatch = useAppDispatch()

  return {
    agents,
    addAgent: (agent: Agent) => dispatch(addAgent(agent)),
    removeAgent: (id: string) => {
      dispatch(removeAgent({ id }))
      const agent = agents.find((a) => a.id === id)
      if (agent) {
        agent.conversations.forEach((id) => localforage.removeItem(`conversation:${id}`))
      }
    },
    updateAgent: (agent: Agent) => dispatch(updateAgent(agent))
  }
}

export function useAgent(id: string) {
  const agent = useAppSelector((state) => state.agents.agents.find((a) => a.id === id) as Agent)
  const dispatch = useAppDispatch()

  return {
    agent,
    addConversation: (conversation: Conversation) => {
      dispatch(_addConversation({ agentId: agent?.id!, conversation }))
    },
    removeConversation: (conversation: Conversation) => {
      dispatch(_removeConversation({ agentId: agent?.id!, conversation }))
    }
  }
}
