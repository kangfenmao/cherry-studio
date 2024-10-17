import { RootState } from '@renderer/store'
import { addAgent, removeAgent, updateAgent, updateAgents } from '@renderer/store/agents'
import { Agent } from '@renderer/types'
import { useDispatch, useSelector } from 'react-redux'

export function useAgents() {
  const agents = useSelector((state: RootState) => state.agents.agents)
  const dispatch = useDispatch()

  return {
    agents,
    addAgent: (agent: Agent) => dispatch(addAgent(agent)),
    removeAgent: (agent: Agent) => dispatch(removeAgent(agent)),
    updateAgent: (agent: Agent) => dispatch(updateAgent(agent)),
    updateAgents: (agents: Agent[]) => dispatch(updateAgents(agents))
  }
}

export function useAgent(id: string) {
  const agents = useSelector((state: RootState) => state.agents.agents)
  const dispatch = useDispatch()
  const agent = agents.find((a) => a.id === id)

  return {
    agent,
    updateAgent: (agent: Agent) => dispatch(updateAgent(agent))
  }
}
