import { Agent } from '@renderer/types'
import { useEffect, useState } from 'react'

export function useActiveTopic(agent: Agent) {
  const [activeTopic, setActiveTopic] = useState(agent?.topics[0])

  useEffect(() => {
    agent?.topics && setActiveTopic(agent?.topics[0])
  }, [agent])

  return { activeTopic, setActiveTopic }
}
