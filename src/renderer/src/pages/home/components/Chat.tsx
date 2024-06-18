import { Message, Thread } from '@renderer/types'
import { FC, useState } from 'react'
import styled from 'styled-components'
import Inputbar from './Inputbar'
import Conversations from './Conversations'
import useThreads from '@renderer/hooks/useThreads'
import { isEmpty } from 'lodash'
import localforage from 'localforage'
import { uuid } from '@renderer/utils'

interface Props {
  thread: Thread
}

const Chat: FC<Props> = ({ thread }) => {
  const [conversationId] = useState<string>(thread.conversations[0] || uuid())

  return (
    <Container>
      <Conversations thread={thread} conversationId={conversationId} />
      <Inputbar thread={thread} />
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
