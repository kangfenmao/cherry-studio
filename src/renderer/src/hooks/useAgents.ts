import { useAppDispatch, useAppSelector } from '@renderer/store'
import {
  addAgent,
  addConversationToAgent,
  removeAgent,
  removeConversationFromAgent,
  updateAgent
} from '@renderer/store/agents'
import { Agent } from '@renderer/types'
import { useState } from 'react'

export default function useAgents() {
  const { agents } = useAppSelector((state) => state.agents)
  const [agentId, setAgentId] = useState(agents[0]?.id)
  const dispatch = useAppDispatch()

  return {
    agents,
    agent: agents.find((t) => t.id === agentId),
    setAgent: (agent: Agent) => setAgentId(agent.id),
    addAgent: (agent: Agent) => dispatch(addAgent(agent)),
    removeAgent: (id: string) => dispatch(removeAgent({ id })),
    updateAgent: (agent: Agent) => dispatch(updateAgent(agent)),
    addConversation: (agentId: string, conversationId: string) => {
      dispatch(addConversationToAgent({ agentId, conversationId }))
    },
    removeConversation: (agentId: string, conversationId: string) => {
      dispatch(removeConversationFromAgent({ agentId, conversationId }))
    }
  }
}
