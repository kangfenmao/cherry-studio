import { Message } from '@renderer/types'
import { FC } from 'react'
import styled from 'styled-components'

interface Props {
  messages: Message[]
}

const Conversations: FC<Props> = ({ messages }) => {
  return (
    <Container>
      {messages.map((message) => (
        <div key={message.id}>{message.content}</div>
      ))}
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 15px;
  overflow-y: scroll;
  &::-webkit-scrollbar {
    display: none;
  }
`

export default Conversations
