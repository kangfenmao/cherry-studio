import { useAppDispatch, useAppSelector } from '@renderer/store'
import {
  addTopic as _addTopic,
  removeTopic as _removeTopic,
  addAgent,
  removeAgent,
  updateAgent
} from '@renderer/store/agents'
import { Agent, Topic } from '@renderer/types'
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
        agent.topics.forEach((id) => localforage.removeItem(`topic:${id}`))
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
    addTopic: (topic: Topic) => {
      dispatch(_addTopic({ agentId: agent?.id!, topic }))
    },
    removeTopic: (topic: Topic) => {
      dispatch(_removeTopic({ agentId: agent?.id!, topic }))
    }
  }
}
