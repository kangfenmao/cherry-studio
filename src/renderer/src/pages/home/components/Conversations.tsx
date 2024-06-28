import { Avatar } from '@douyinfe/semi-ui'
import useAgents from '@renderer/hooks/useAgents'
import { EVENT_NAMES, EventEmitter } from '@renderer/services/event'
import { Conversation, Message, Agent } from '@renderer/types'
import { runAsyncFunction } from '@renderer/utils'
import localforage from 'localforage'
import { isEmpty } from 'lodash'
import { FC, useEffect, useState } from 'react'
import styled from 'styled-components'

interface Props {
  agent: Agent
  conversationId: string
}

const Conversations: FC<Props> = ({ agent, conversationId }) => {
  const [messages, setMessages] = useState<Message[]>([])
  const { addConversation } = useAgents()

  const onSendMessage = (message: Message) => {
    setMessages([...messages, message])

    if (isEmpty(agent?.conversations)) {
      addConversation(agent.id, conversationId)
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
