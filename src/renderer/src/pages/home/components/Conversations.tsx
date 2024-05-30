import type { Conversation } from '@renderer/hooks/useConversactions'
import { FC } from 'react'
import styled from 'styled-components'

interface Props {
  conversations: Conversation[]
  activeConversation?: Conversation
  onSelectConversation: (conversation: Conversation) => void
}

const Conversations: FC<Props> = ({ conversations, activeConversation, onSelectConversation }) => {
  return (
    <Container>
      {conversations.map((conversation) => (
        <Conversation
          key={conversation.id}
          onClick={() => onSelectConversation(conversation)}
          className={conversation.id === activeConversation?.id ? 'active' : ''}>
          <ConversationTime>{conversation.lastMessageAt}</ConversationTime>
          <ConversationName>{conversation.name}</ConversationName>
          <ConversationLastMessage>{conversation.lastMessage}</ConversationLastMessage>
        </Conversation>
      ))}
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-width: var(--conversations-width);
  border-right: 1px solid #ffffff20;
  height: calc(100vh - var(--navbar-height) - var(--status-bar-height));
  padding: 10px;
  overflow-y: scroll;
`

const Conversation = styled.div`
  display: flex;
  flex-direction: column;
  padding: 10px;
  cursor: pointer;
  &:hover {
    background-color: var(--color-background-soft);
  }
  &.active {
    background-color: var(--color-background-mute);
    cursor: pointer;
  }
  border-radius: 8px;
  margin-bottom: 10px;
`

const ConversationTime = styled.div`
  font-size: 12px;
  color: var(--color-text-2);
`

const ConversationName = styled.div`
  font-size: 14px;
  color: var(--color-text-1);
  font-weight: bold;
`

const ConversationLastMessage = styled.div`
  font-size: 12px;
  color: var(--color-text-2);
`

export default Conversations
