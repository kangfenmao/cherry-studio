import { useAssistant } from '@renderer/hooks/useAssistant'
import { Assistant, Topic } from '@renderer/types'
import { Flex } from 'antd'
import { FC, useState } from 'react'
import styled from 'styled-components'

import Inputbar from './Inputbar/Inputbar'
import Messages from './Messages/Messages'
import Settings from './Settings'

interface Props {
  assistant: Assistant
  activeTopic: Topic
  setActiveTopic: (topic: Topic) => void
}

const Chat: FC<Props> = (props) => {
  const { assistant } = useAssistant(props.assistant.id)
  const [showSetting, setShowSetting] = useState(false)

  return (
    <Container id="chat">
      <Main vertical flex={1} justify="space-between">
        <Messages assistant={assistant} topic={props.activeTopic} />
        <Inputbar
          assistant={assistant}
          setActiveTopic={props.setActiveTopic}
          showSetting={showSetting}
          setShowSetting={setShowSetting}
        />
      </Main>
      {showSetting && <Settings assistant={assistant} onClose={() => setShowSetting(false)} />}
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
