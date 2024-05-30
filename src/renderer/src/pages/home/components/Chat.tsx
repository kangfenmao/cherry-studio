import { Conversation } from '@renderer/hooks/useConversactions'
import { FC } from 'react'
import styled from 'styled-components'

interface Props {
  activeConversation?: Conversation
}

const Chat: FC<Props> = ({ activeConversation }) => {
  return <Container>{activeConversation?.lastMessage}</Container>
}

const Container = styled.div`
  display: flex;
  height: 100%;
  flex: 1;
  border-right: 1px solid #ffffff20;
`

export default Chat
