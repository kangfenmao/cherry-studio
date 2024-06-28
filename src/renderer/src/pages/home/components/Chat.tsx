import { Message, Agent } from '@renderer/types'
import { FC, useState } from 'react'
import styled from 'styled-components'
import Inputbar from './Inputbar'
import Conversations from './Conversations'
import useAgents from '@renderer/hooks/useAgents'
import { isEmpty } from 'lodash'
import localforage from 'localforage'
import { uuid } from '@renderer/utils'

interface Props {
  agent: Agent
}

const Chat: FC<Props> = ({ agent }) => {
  const [conversationId] = useState<string>(agent.conversations[0] || uuid())

  return (
    <Container>
      <Conversations agent={agent} conversationId={conversationId} />
      <Inputbar agent={agent} />
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
