import { Assistant } from '@renderer/types'
import { useEffect, useState } from 'react'

export function useActiveTopic(assistant: Assistant) {
  const [activeTopic, setActiveTopic] = useState(assistant?.topics[0])

  useEffect(() => {
    assistant?.topics && setActiveTopic(assistant?.topics[0])
  }, [assistant])

  return { activeTopic, setActiveTopic }
}
