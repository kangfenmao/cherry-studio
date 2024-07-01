import { useAppDispatch, useAppSelector } from '@renderer/store'
import {
  addAgent,
  addConversationToAgent,
  removeAgent,
  removeConversationFromAgent,
  updateAgent
} from '@renderer/store/agents'
import { Agent } from '@renderer/types'
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
    updateAgent: (agent: Agent) => dispatch(updateAgent(agent)),
    addConversation: (agentId: string, conversationId: string) => {
      dispatch(addConversationToAgent({ agentId, conversationId }))
    },
    removeConversation: (agentId: string, conversationId: string) => {
      dispatch(removeConversationFromAgent({ agentId, conversationId }))
    }
  }
}
