import { Message } from '@renderer/types'
import { FC, useState } from 'react'
import styled from 'styled-components'
import Inputbar from './Inputbar'
import Conversations from './Conversations'
import useThreads from '@renderer/hooks/useThreads'

const Chat: FC = () => {
  const { activeThread } = useThreads()
  const [messages, setMessages] = useState<Message[]>([])

  const onSendMessage = (message: Message) => {
    setMessages([...messages, message])
  }

  return (
    <Container>
      <Conversations messages={messages}></Conversations>
      <Inputbar onSendMessage={onSendMessage} activeThread={activeThread} />
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  flex: 1;
  border-right: 1px solid #ffffff20;
`

export default Chat
