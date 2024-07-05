import { useAppDispatch, useAppSelector } from '@renderer/store'
import {
  addTopic as _addTopic,
  removeAllTopics as _removeAllTopics,
  removeTopic as _removeTopic,
  setModel as _setModel,
  updateTopic as _updateTopic,
  addAssistant,
  removeAssistant,
  updateAssistant
} from '@renderer/store/assistants'
import { Assistant, Model, Topic } from '@renderer/types'
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
  const { defaultModel } = useDefaultModel()

  return {
    assistant,
    model: assistant?.model ?? defaultModel,
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
    },
    setModel: (model: Model) => {
      dispatch(_setModel({ assistantId: assistant.id, model }))
    }
  }
}

export function useDefaultModel() {
  const defaultModel = useAppSelector((state) => state.llm.defaultModel)
  return { defaultModel }
}
