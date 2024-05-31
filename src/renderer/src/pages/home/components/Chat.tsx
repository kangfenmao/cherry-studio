import { Thread } from '@renderer/types'
import { FC } from 'react'
import styled from 'styled-components'

interface Props {
  activeThread?: Thread
}

const Chat: FC<Props> = ({ activeThread }) => {
  return <Container>{activeThread?.lastMessage}</Container>
}

const Container = styled.div`
  display: flex;
  height: 100%;
  flex: 1;
  border-right: 1px solid #ffffff20;
  padding: 15px;
`

export default Chat
