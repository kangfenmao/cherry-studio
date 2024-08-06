import { useAssistant } from '@renderer/hooks/useAssistant'
import { useProviderByAssistant } from '@renderer/hooks/useProvider'
import { fetchChatCompletion, fetchMessagesSummary } from '@renderer/services/api'
import { EVENT_NAMES, EventEmitter } from '@renderer/services/event'
import { estimateHistoryTokenCount, filterAtMessages } from '@renderer/services/messages'
import LocalStorage from '@renderer/services/storage'
import { Assistant, Message, Model, Topic } from '@renderer/types'
import { getBriefInfo, runAsyncFunction, uuid } from '@renderer/utils'
import { t } from 'i18next'
import localforage from 'localforage'
import { debounce, last, reverse } from 'lodash'
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import styled from 'styled-components'

import MessageItem from './Message'
import Suggestions from './Suggestions'

interface Props {
  assistant: Assistant
  topic: Topic
}

const Messages: FC<Props> = ({ assistant, topic }) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [lastMessage, setLastMessage] = useState<Message | null>(null)
  const provider = useProviderByAssistant(assistant)
  const containerRef = useRef<HTMLDivElement>(null)
  const { updateTopic } = useAssistant(assistant.id)

  const assistantDefaultMessage: Message = useMemo(
    () => ({
      id: 'assistant',
      role: 'assistant',
      content: assistant.description || assistant.prompt || t('chat.default.description'),
      assistantId: assistant.id,
      topicId: topic.id,
      status: 'pending',
      createdAt: new Date().toISOString()
    }),
    [assistant.description, assistant.id, assistant.prompt, topic.id]
  )

  const onSendMessage = useCallback(
    (message: Message) => {
      const _messages = [...messages, message]
      setMessages(_messages)
      localforage.setItem(`topic:${topic.id}`, { ...topic, messages: _messages })
    },
    [messages, topic]
  )

  const autoRenameTopic = useCallback(async () => {
    if (topic.name === t('chat.default.topic.name') && messages.length >= 2) {
      const summaryText = await fetchMessagesSummary({ messages, assistant })
      summaryText && updateTopic({ ...topic, name: summaryText })
    }
  }, [assistant, messages, topic, updateTopic])

  const onDeleteMessage = useCallback(
    (message: Message) => {
      const _messages = messages.filter((m) => m.id !== message.id)
      setMessages(_messages)
      localforage.setItem(`topic:${topic.id}`, { id: topic.id, messages: _messages })
    },
    [messages, topic.id]
  )

  useEffect(() => {
    const unsubscribes = [
      EventEmitter.on(EVENT_NAMES.SEND_MESSAGE, async (msg: Message) => {
        onSendMessage(msg)
        fetchChatCompletion({ assistant, messages: [...messages, msg], topic, onResponse: setLastMessage })
      }),
      EventEmitter.on(EVENT_NAMES.AI_CHAT_COMPLETION, async (msg: Message) => {
        setLastMessage(null)
        onSendMessage(msg)
        setTimeout(() => EventEmitter.emit(EVENT_NAMES.AI_AUTO_RENAME), 100)
      }),
      EventEmitter.on(EVENT_NAMES.REGENERATE_MESSAGE, async (model: Model) => {
        const lastUserMessage = last(filterAtMessages(messages).filter((m) => m.role === 'user'))
        if (lastUserMessage) {
          const content = `[@${model.name}](#)  ${getBriefInfo(lastUserMessage.content)}`
          onSendMessage({ ...lastUserMessage, id: uuid(), type: '@', content })
          fetchChatCompletion({
            assistant,
            topic,
            messages: [...messages, lastUserMessage],
            onResponse: setLastMessage
          })
        }
      }),
      EventEmitter.on(EVENT_NAMES.AI_AUTO_RENAME, autoRenameTopic),
      EventEmitter.on(EVENT_NAMES.CLEAR_MESSAGES, () => {
        setMessages([])
        updateTopic({ ...topic, messages: [] })
        LocalStorage.clearTopicMessages(topic.id)
      })
    ]
    return () => unsubscribes.forEach((unsub) => unsub())
  }, [assistant, messages, provider, topic, autoRenameTopic, updateTopic, onSendMessage])

  useEffect(() => {
    runAsyncFunction(async () => setMessages((await LocalStorage.getTopicMessages(topic.id)) || []))
  }, [topic.id])

  const scrollTop = useCallback(
    debounce(() => containerRef.current?.scrollTo({ top: 100000, behavior: 'auto' }), 500, {
      leading: true,
      trailing: false
    }),
    []
  )

  useEffect(() => {
    scrollTop()
  }, [messages, lastMessage, scrollTop])

  useEffect(() => {
    EventEmitter.emit(EVENT_NAMES.ESTIMATED_TOKEN_COUNT, estimateHistoryTokenCount(assistant, messages))
  }, [assistant, messages])

  return (
    <Container id="messages" key={assistant.id} ref={containerRef}>
      <Suggestions assistant={assistant} messages={messages} lastMessage={lastMessage} />
      {lastMessage && <MessageItem message={lastMessage} />}
      {reverse([...messages]).map((message, index) => (
        <MessageItem key={message.id} message={message} showMenu index={index} onDeleteMessage={onDeleteMessage} />
      ))}
      <MessageItem message={assistantDefaultMessage} />
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  flex-direction: column-reverse;
  max-height: calc(100vh - var(--input-bar-height) - var(--navbar-height));
`

export default Messages
