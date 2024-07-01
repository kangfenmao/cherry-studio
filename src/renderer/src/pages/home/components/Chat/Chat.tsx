import { Agent } from '@renderer/types'
import { FC, useEffect, useState } from 'react'
import styled from 'styled-components'
import Inputbar from './Inputbar'
import Conversations from './Conversations'
import { uuid } from '@renderer/utils'
import { Flex } from 'antd'
import TopicList from './TopicList'

interface Props {
  agent: Agent
}

const Chat: FC<Props> = ({ agent }) => {
  const [conversationId, setConversationId] = useState<string>(agent?.conversations[0] || uuid())

  useEffect(() => {
    setConversationId(agent?.conversations[0] || uuid())
  }, [agent])

  if (!agent) {
    return null
  }

  return (
    <Container id="chat">
      <Flex vertical flex={1} justify="space-between">
        <Conversations agent={agent} conversationId={conversationId} />
        <Inputbar agent={agent} />
      </Flex>
      <TopicList />
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: row;
  height: 100%;
  flex: 1;
  justify-content: space-between;
`

export default Chat
