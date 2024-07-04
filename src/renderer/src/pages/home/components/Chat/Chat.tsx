import { Assistant } from '@renderer/types'
import { FC } from 'react'
import styled from 'styled-components'
import Inputbar from './Inputbar'
import Conversations from './Conversations'
import { Flex } from 'antd'
import TopicList from './TopicList'
import { useAssistant } from '@renderer/hooks/useAssistant'
import { useActiveTopic } from '@renderer/hooks/useTopic'

interface Props {
  assistant: Assistant
}

const Chat: FC<Props> = (props) => {
  const { assistant } = useAssistant(props.assistant.id)
  const { activeTopic, setActiveTopic } = useActiveTopic(assistant)

  if (!assistant) {
    return null
  }

  return (
    <Container id="chat">
      <Flex vertical flex={1} justify="space-between">
        <Conversations assistant={assistant} topic={activeTopic} />
        <Inputbar assistant={assistant} setActiveTopic={setActiveTopic} />
      </Flex>
      <TopicList assistant={assistant} activeTopic={activeTopic} setActiveTopic={setActiveTopic} />
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
