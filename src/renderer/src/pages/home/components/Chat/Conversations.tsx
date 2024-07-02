import { EVENT_NAMES, EventEmitter } from '@renderer/services/event'
import { Agent, Message, Topic } from '@renderer/types'
import localforage from 'localforage'
import { FC, useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'
import MessageItem from './Message'
import { reverse } from 'lodash'
import hljs from 'highlight.js'
import { fetchChatCompletion, fetchConversationSummary } from '@renderer/services/api'
import { useAgent } from '@renderer/hooks/useAgents'
import { DEFAULT_TOPIC_NAME } from '@renderer/config/constant'
import { runAsyncFunction } from '@renderer/utils'
import LocalStorage from '@renderer/services/storage'

interface Props {
  agent: Agent
  topic: Topic
}

const Conversations: FC<Props> = ({ agent, topic }) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [lastMessage, setLastMessage] = useState<Message | null>(null)
  const { updateTopic } = useAgent(agent.id)

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
      const summaryText = await fetchConversationSummary({ messages })
      if (summaryText) {
        updateTopic({ ...topic, name: summaryText })
      }
    }
  }, [messages, topic, updateTopic])

  useEffect(() => {
    const unsubscribes = [
      EventEmitter.on(EVENT_NAMES.SEND_MESSAGE, async (msg: Message) => {
        onSendMessage(msg)
        fetchChatCompletion({ agent, message: msg, topic, onResponse: setLastMessage })
      }),
      EventEmitter.on(EVENT_NAMES.AI_CHAT_COMPLETION, async (msg: Message) => {
        setLastMessage(null)
        onSendMessage(msg)
        setTimeout(() => EventEmitter.emit(EVENT_NAMES.AI_AUTO_RENAME), 100)
      }),
      EventEmitter.on(EVENT_NAMES.AI_AUTO_RENAME, autoRenameTopic)
    ]
    return () => unsubscribes.forEach((unsub) => unsub())
  }, [agent, autoRenameTopic, onSendMessage, topic])

  useEffect(() => {
    runAsyncFunction(async () => {
      const messages = await LocalStorage.getTopicMessages(topic.id)
      setMessages(messages)
    })
  }, [topic.id])

  useEffect(() => hljs.highlightAll())

  return (
    <Container id="topics">
      {lastMessage && <MessageItem message={lastMessage} />}
      {reverse([...messages]).map((message) => (
        <MessageItem message={message} key={message.id} />
      ))}
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  overflow-y: scroll;
  flex-direction: column-reverse;
  max-height: calc(100vh - var(--input-bar-height) - var(--navbar-height));
  &::-webkit-scrollbar {
    display: none;
  }
`

export default Conversations
