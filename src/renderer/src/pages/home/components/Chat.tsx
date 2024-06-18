import { Thread } from '@renderer/types'
import { FC } from 'react'
import styled from 'styled-components'
import Inputbar from './Inputbar'

interface Props {
  activeThread?: Thread
}

const Chat: FC<Props> = ({ activeThread }) => {
  return (
    <Container>
      <Conversations>{activeThread?.lastMessage}</Conversations>
      <Inputbar />
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

const Conversations = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 15px;
  overflow-y: scroll;
  &::-webkit-scrollbar {
    display: none;
  }
`

export default Chat
