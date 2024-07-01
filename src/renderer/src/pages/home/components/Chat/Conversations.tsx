import { EVENT_NAMES, EventEmitter } from '@renderer/services/event'
import { openaiProvider } from '@renderer/services/provider'
import { Agent, Message, Topic } from '@renderer/types'
import { runAsyncFunction, uuid } from '@renderer/utils'
import localforage from 'localforage'
import { FC, useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'
import MessageItem from './Message'
import { reverse } from 'lodash'
import hljs from 'highlight.js'

interface Props {
  agent: Agent
  topic: Topic
}

const Conversations: FC<Props> = ({ agent, topic }) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [lastMessage, setLastMessage] = useState<Message | null>(null)

  const { id: topicId } = topic

  const onSendMessage = useCallback(
    (message: Message) => {
      const _messages = [...messages, message]
      setMessages(_messages)

      const topic = {
        id: topicId,
        name: 'Default Topic',
        messages: _messages
      }

      localforage.setItem<Topic>(`topic:${topicId}`, topic)
    },
    [topicId, messages]
  )

  const fetchChatCompletion = useCallback(
    async (message: Message) => {
      const stream = await openaiProvider.chat.completions.create({
        model: 'Qwen/Qwen2-7B-Instruct',
        messages: [{ role: 'user', content: message.content }],
        stream: true
      })

      const _message: Message = {
        id: uuid(),
        role: 'agent',
        content: '',
        agentId: agent.id,
        topicId,
        createdAt: 'now'
      }

      let content = ''

      for await (const chunk of stream) {
        content = content + (chunk.choices[0]?.delta?.content || '')
        setLastMessage({ ..._message, content })
      }

      _message.content = content

      EventEmitter.emit(EVENT_NAMES.AI_CHAT_COMPLETION, _message)

      return _message
    },
    [agent.id, topicId]
  )

  useEffect(() => {
    const unsubscribes = [
      EventEmitter.on(EVENT_NAMES.SEND_MESSAGE, async (msg: Message) => {
        onSendMessage(msg)
        fetchChatCompletion(msg)
      }),
      EventEmitter.on(EVENT_NAMES.AI_CHAT_COMPLETION, async (msg: Message) => {
        setLastMessage(null)
        onSendMessage(msg)
      })
    ]
    return () => unsubscribes.forEach((unsub) => unsub())
  }, [fetchChatCompletion, onSendMessage])

  useEffect(() => {
    runAsyncFunction(async () => {
      const topic = await localforage.getItem<Topic>(`topic:${topicId}`)
      setMessages(topic ? topic.messages : [])
    })
  }, [topicId])

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
