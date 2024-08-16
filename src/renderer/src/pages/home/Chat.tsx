import { useAssistant } from '@renderer/hooks/useAssistant'
import { useActiveTopic } from '@renderer/hooks/useTopic'
import { Assistant } from '@renderer/types'
import { Flex } from 'antd'
import { FC } from 'react'
import styled from 'styled-components'

import Inputbar from './Inputbar/Inputbar'
import Messages from './Messages/Messages'
import RightSidebar from './RightSidebar'

interface Props {
  assistant: Assistant
}

const Chat: FC<Props> = (props) => {
  const { assistant } = useAssistant(props.assistant.id)
  const { activeTopic, setActiveTopic } = useActiveTopic(assistant)

  return (
    <Container id="chat">
      <Main vertical flex={1} justify="space-between">
        <Messages assistant={assistant} topic={activeTopic} />
        <Inputbar assistant={assistant} setActiveTopic={setActiveTopic} />
      </Main>
      <RightSidebar assistant={assistant} activeTopic={activeTopic} setActiveTopic={setActiveTopic} />
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

const Main = styled(Flex)`
  height: calc(100vh - var(--navbar-height));
`

export default Chat
