import { Avatar } from '@douyinfe/semi-ui'
import useThreads from '@renderer/hooks/useThreads'
import { EVENT_NAMES, EventEmitter } from '@renderer/services/event'
import { Conversation, Message, Thread } from '@renderer/types'
import { runAsyncFunction } from '@renderer/utils'
import localforage from 'localforage'
import { isEmpty } from 'lodash'
import { FC, useEffect, useState } from 'react'
import styled from 'styled-components'

interface Props {
  thread: Thread
  conversationId: string
}

const Conversations: FC<Props> = ({ thread, conversationId }) => {
  const [messages, setMessages] = useState<Message[]>([])
  const { addConversation } = useThreads()

  const onSendMessage = (message: Message) => {
    setMessages([...messages, message])

    if (isEmpty(thread?.conversations)) {
      addConversation(thread.id, conversationId)
    }

    localforage.setItem<Conversation>(`conversation:${conversationId}`, {
      id: conversationId,
      messages: [...messages, message]
    })
  }

  useEffect(() => {
    runAsyncFunction(async () => {
      const conversation = await localforage.getItem<Conversation>(`conversation:${conversationId}`)
      conversation && setMessages(conversation.messages)
    })
  }, [conversationId])

  useEffect(() => {
    const unsubscribe = EventEmitter.on(EVENT_NAMES.SEND_MESSAGE, onSendMessage)
    return () => unsubscribe()
  }, [onSendMessage])

  return (
    <Container>
      {messages.map((message) => (
        <ConversationItem key={message.id}>
          <AvatarWrapper>
            <Avatar size="small" alt="Alice Swift">
              Y
            </Avatar>
          </AvatarWrapper>
          <div>{message.content}</div>
        </ConversationItem>
      ))}
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow-y: scroll;
  &::-webkit-scrollbar {
    display: none;
  }
`

const ConversationItem = styled.div`
  display: flex;
  flex-direction: row;
  padding: 10px 15px;
  position: relative;
  cursor: pointer;
  &:hover {
    background-color: var(--color-background-soft);
  }
`

const AvatarWrapper = styled.div`
  margin-right: 10px;
`

export default Conversations
