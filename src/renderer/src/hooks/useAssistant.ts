import { useAppDispatch, useAppSelector } from '@renderer/store'
import {
  addTopic as _addTopic,
  removeAllTopics as _removeAllTopics,
  removeTopic as _removeTopic,
  updateTopic as _updateTopic,
  addAssistant,
  removeAssistant,
  updateAssistant
} from '@renderer/store/assistants'
import { Assistant, Topic } from '@renderer/types'
import localforage from 'localforage'

export function useAssistants() {
  const { assistants } = useAppSelector((state) => state.assistants)
  const dispatch = useAppDispatch()

  return {
    assistants,
    addAssistant: (assistant: Assistant) => dispatch(addAssistant(assistant)),
    removeAssistant: (id: string) => {
      dispatch(removeAssistant({ id }))
      const assistant = assistants.find((a) => a.id === id)
      if (assistant) {
        assistant.topics.forEach((id) => localforage.removeItem(`topic:${id}`))
      }
    },
    updateAssistant: (assistant: Assistant) => dispatch(updateAssistant(assistant))
  }
}

export function useAssistant(id: string) {
  const assistant = useAppSelector((state) => state.assistants.assistants.find((a) => a.id === id) as Assistant)
  const dispatch = useAppDispatch()

  return {
    assistant,
    addTopic: (topic: Topic) => {
      dispatch(_addTopic({ assistantId: assistant.id, topic }))
    },
    removeTopic: (topic: Topic) => {
      dispatch(_removeTopic({ assistantId: assistant.id, topic }))
    },
    updateTopic: (topic: Topic) => {
      dispatch(_updateTopic({ assistantId: assistant.id, topic }))
    },
    removeAllTopics: () => {
      dispatch(_removeAllTopics({ assistantId: assistant.id }))
    }
  }
}
