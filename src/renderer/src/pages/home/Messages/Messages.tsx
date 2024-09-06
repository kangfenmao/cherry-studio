import { useAssistant } from '@renderer/hooks/useAssistant'
import { useProviderByAssistant } from '@renderer/hooks/useProvider'
import { getTopic } from '@renderer/hooks/useTopic'
import { fetchChatCompletion, fetchMessagesSummary } from '@renderer/services/api'
import { EVENT_NAMES, EventEmitter } from '@renderer/services/event'
import { estimateHistoryTokenCount, filterMessages, getContextCount } from '@renderer/services/messages'
import LocalStorage from '@renderer/services/storage'
import { Assistant, Message, Model, Topic } from '@renderer/types'
import { getBriefInfo, runAsyncFunction, uuid } from '@renderer/utils'
import { t } from 'i18next'
import localforage from 'localforage'
import { last, reverse } from 'lodash'
import { FC, useCallback, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

import Suggestions from '../components/Suggestions'
import MessageItem from './Message'
import Prompt from './Prompt'

interface Props {
  assistant: Assistant
  topic: Topic
  setActiveTopic: (topic: Topic) => void
}

const Messages: FC<Props> = ({ assistant, topic, setActiveTopic }) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [lastMessage, setLastMessage] = useState<Message | null>(null)
  const provider = useProviderByAssistant(assistant)
  const containerRef = useRef<HTMLDivElement>(null)
  const { updateTopic } = useAssistant(assistant.id)

  const onSendMessage = useCallback(
    (message: Message) => {
      const _messages = [...messages, message]
      setMessages(_messages)
      localforage.setItem(`topic:${topic.id}`, { id: topic.id, messages: _messages })
    },
    [messages, topic]
  )

  const autoRenameTopic = useCallback(async () => {
    const _topic = getTopic(assistant, topic.id)
    if (_topic && _topic.name === t('chat.default.topic.name') && messages.length >= 2) {
      const summaryText = await fetchMessagesSummary({ messages, assistant })
      if (summaryText) {
        const data = { ..._topic, name: summaryText }
        setActiveTopic(data)
        updateTopic(data)
      }
    }
  }, [assistant, messages, setActiveTopic, topic.id, updateTopic])

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
        const lastUserMessage = last(filterMessages(messages).filter((m) => m.role === 'user'))
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
      }),
      EventEmitter.on(EVENT_NAMES.NEW_CONTEXT, () => {
        const lastMessage = last(messages)

        if (lastMessage && lastMessage.type === 'clear') {
          return
        }

        if (messages.length === 0) {
          return
        }

        onSendMessage({
          id: uuid(),
          assistantId: assistant.id,
          role: 'user',
          content: '',
          topicId: topic.id,
          createdAt: new Date().toISOString(),
          status: 'success',
          type: 'clear'
        } as Message)
      })
    ]
    return () => unsubscribes.forEach((unsub) => unsub())
  }, [assistant, messages, provider, topic, autoRenameTopic, updateTopic, onSendMessage])

  useEffect(() => {
    runAsyncFunction(async () => {
      const messages = (await LocalStorage.getTopicMessages(topic.id)) || []
      setMessages(messages)
    })
  }, [topic.id])

  useEffect(() => {
    setTimeout(() => containerRef.current?.scrollTo({ top: containerRef.current.scrollHeight, behavior: 'auto' }), 0)
  }, [messages])

  useEffect(() => {
    EventEmitter.emit(EVENT_NAMES.ESTIMATED_TOKEN_COUNT, {
      tokensCount: estimateHistoryTokenCount(assistant, messages),
      contextCount: getContextCount(assistant, messages)
    })
  }, [assistant, messages])

  return (
    <Container id="messages" key={assistant.id} ref={containerRef}>
      <Suggestions assistant={assistant} messages={messages} lastMessage={lastMessage} />
      {lastMessage && <MessageItem message={lastMessage} />}
      {reverse([...messages]).map((message, index) => (
        <MessageItem key={message.id} message={message} showMenu index={index} onDeleteMessage={onDeleteMessage} />
      ))}
      <Prompt assistant={assistant} key={assistant.prompt} />
    </Container>
  )
}

const Container = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  flex-direction: column-reverse;
  max-height: calc(100vh - var(--input-bar-height) - var(--navbar-height));
  padding: 10px 0;
`

export default Messages
