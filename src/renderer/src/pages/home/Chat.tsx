import { useAssistant } from '@renderer/hooks/useAssistant'
import { useShowRightSidebar, useShowTopics } from '@renderer/hooks/useStore'
import { Assistant, Topic } from '@renderer/types'
import { Flex } from 'antd'
import { FC, useEffect, useState } from 'react'
import styled from 'styled-components'

import Inputbar from './Inputbar/Inputbar'
import Messages from './Messages/Messages'
import Topics from './Topics'

interface Props {
  assistant: Assistant
  activeTopic: Topic
  setActiveTopic: (topic: Topic) => void
}

const Chat: FC<Props> = (props) => {
  const { assistant } = useAssistant(props.assistant.id)
  const [showSetting, setShowSetting] = useState(false)
  const { rightSidebarShown } = useShowRightSidebar()
  const { showTopics } = useShowTopics()

  useEffect(() => {
    !rightSidebarShown && showSetting && setShowSetting(false)
  }, [rightSidebarShown, showSetting])

  return (
    <Container id="chat">
      {showTopics && (
        <Topics assistant={assistant} activeTopic={props.activeTopic} setActiveTopic={props.setActiveTopic} />
      )}
      <Main vertical flex={1} justify="space-between">
        <Messages assistant={assistant} topic={props.activeTopic} setActiveTopic={props.setActiveTopic} />
        <Inputbar assistant={assistant} setActiveTopic={props.setActiveTopic} />
      </Main>
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
