import { Assistant, Topic } from '@renderer/types'
import { find } from 'lodash'
import { useEffect, useState } from 'react'

const activeTopicsMap = new Map<string, Topic>()

export function useActiveTopic(assistant: Assistant) {
  const [activeTopic, setActiveTopic] = useState(activeTopicsMap.get(assistant.id) || assistant?.topics[0])

  activeTopicsMap.set(assistant.id, activeTopic)

  useEffect(() => {
    // activeTopic not in assistant.topics
    if (assistant && !find(assistant.topics, { id: activeTopic?.id })) {
      setActiveTopic(assistant.topics[0])
    }
  }, [activeTopic?.id, assistant])

  return { activeTopic, setActiveTopic }
}
