import { EVENT_NAMES, EventEmitter } from '@renderer/services/event'
import { Assistant, Message, Topic } from '@renderer/types'
import localforage from 'localforage'
import { FC, useCallback, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import MessageItem from './Message'
import { reverse } from 'lodash'
import hljs from 'highlight.js'
import { fetchChatCompletion, fetchMessagesSummary } from '@renderer/services/api'
import { useAssistant } from '@renderer/hooks/useAssistant'
import { DEFAULT_TOPIC_NAME } from '@renderer/config/constant'
import { runAsyncFunction } from '@renderer/utils'
import LocalStorage from '@renderer/services/storage'
import { useProviderByAssistant } from '@renderer/hooks/useProvider'

interface Props {
  assistant: Assistant
  topic: Topic
}

const Messages: FC<Props> = ({ assistant, topic }) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [lastMessage, setLastMessage] = useState<Message | null>(null)
  const { updateTopic } = useAssistant(assistant.id)
  const provider = useProviderByAssistant(assistant)
  const messagesRef = useRef<HTMLDivElement>(null)

  const assistantDefaultMessage: Message = {
    id: 'assistant',
    role: 'assistant',
    content: assistant.description,
    assistantId: assistant.id,
    topicId: topic.id,
    createdAt: new Date().toISOString()
  }

  const onSendMessage = useCallback(
    (message: Message) => {
      const _messages = [...messages, message]
      setMessages(_messages)
      localforage.setItem(`topic:${topic.id}`, {
        ...topic,
        messages: _messages
      })
    },
    [messages, topic]
  )

  const autoRenameTopic = useCallback(async () => {
    if (topic.name === DEFAULT_TOPIC_NAME && messages.length >= 2) {
      const summaryText = await fetchMessagesSummary({ messages, assistant })
      summaryText && updateTopic({ ...topic, name: summaryText })
    }
  }, [assistant, messages, topic, updateTopic])

  const onDeleteMessage = (message: Message) => {
    const _messages = messages.filter((m) => m.id !== message.id)
    setMessages(_messages)
    localforage.setItem(`topic:${topic.id}`, {
      ...topic,
      messages: _messages
    })
  }

  useEffect(() => {
    const unsubscribes = [
      EventEmitter.on(EVENT_NAMES.SEND_MESSAGE, async (msg: Message) => {
        console.debug({ assistant, provider, message: msg, topic })
        onSendMessage(msg)
        fetchChatCompletion({ assistant, messages: [...messages, msg], topic, onResponse: setLastMessage })
      }),
      EventEmitter.on(EVENT_NAMES.AI_CHAT_COMPLETION, async (msg: Message) => {
        setLastMessage(null)
        onSendMessage(msg)
        setTimeout(() => EventEmitter.emit(EVENT_NAMES.AI_AUTO_RENAME), 100)
      }),
      EventEmitter.on(EVENT_NAMES.AI_AUTO_RENAME, autoRenameTopic),
      EventEmitter.on(EVENT_NAMES.CLEAR_MESSAGES, () => {
        setMessages([])
        updateTopic({ ...topic, messages: [] })
        LocalStorage.clearTopicMessages(topic.id)
      })
    ]
    return () => unsubscribes.forEach((unsub) => unsub())
  }, [assistant, autoRenameTopic, messages, onSendMessage, provider, topic, updateTopic])

  useEffect(() => {
    runAsyncFunction(async () => {
      const messages = await LocalStorage.getTopicMessages(topic.id)
      setMessages(messages || [])
    })
  }, [topic.id])

  useEffect(() => hljs.highlightAll(), [messages, lastMessage])

  useEffect(() => {
    messagesRef.current?.scrollTo({ top: 100000, behavior: 'auto' })
  }, [messages])

  return (
    <Container id="messages" key={assistant.id} ref={messagesRef}>
      {lastMessage && <MessageItem message={lastMessage} />}
      {reverse([...messages]).map((message) => (
        <MessageItem message={message} key={message.id} showMenu onDeleteMessage={onDeleteMessage} />
      ))}
      <MessageItem message={assistantDefaultMessage} />
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  overflow-y: scroll;
  flex-direction: column-reverse;
  max-height: calc(100vh - var(--input-bar-height) - var(--navbar-height));
  padding-top: 10px;
  padding-bottom: 20px;
  &::-webkit-scrollbar {
    display: none;
  }
`

export default Messages
