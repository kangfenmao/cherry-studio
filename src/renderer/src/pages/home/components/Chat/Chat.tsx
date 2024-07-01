import { Agent } from '@renderer/types'
import { FC } from 'react'
import styled from 'styled-components'
import Inputbar from './Inputbar'
import Conversations from './Conversations'
import { Flex } from 'antd'
import TopicList from './TopicList'
import { useAgent } from '@renderer/hooks/useAgents'

interface Props {
  agent: Agent
}

const Chat: FC<Props> = (props) => {
  const { agent } = useAgent(props.agent.id)

  if (!agent) {
    return null
  }

  return (
    <Container id="chat">
      <Flex vertical flex={1} justify="space-between">
        <Conversations agent={agent} />
        <Inputbar agent={agent} />
      </Flex>
      <TopicList agent={agent} />
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
