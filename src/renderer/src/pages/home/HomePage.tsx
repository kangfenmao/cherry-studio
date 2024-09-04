import { useAssistants, useDefaultAssistant } from '@renderer/hooks/useAssistant'
import { useShowAssistants } from '@renderer/hooks/useStore'
import { useActiveTopic } from '@renderer/hooks/useTopic'
import { Assistant, Topic } from '@renderer/types'
import { uuid } from '@renderer/utils'
import { FC, useState } from 'react'
import styled from 'styled-components'

import Assistants from './Assistants'
import Chat from './Chat'
import Navbar from './Navbar'

let _activeAssistant: Assistant

const HomePage: FC = () => {
  const { assistants, addAssistant } = useAssistants()
  const [activeAssistant, setActiveAssistant] = useState(_activeAssistant || assistants[0])
  const { showAssistants } = useShowAssistants()
  const { defaultAssistant } = useDefaultAssistant()

  const { activeTopic, setActiveTopic } = useActiveTopic(activeAssistant)

  _activeAssistant = activeAssistant

  const onCreateDefaultAssistant = () => {
    const assistant = { ...defaultAssistant, id: uuid() }
    addAssistant(assistant)
    setActiveAssistant(assistant)
  }

  const onSetActiveTopic = (topic: Topic) => {
    setActiveTopic(topic)
  }

  return (
    <Container>
      <Navbar activeAssistant={activeAssistant} setActiveAssistant={setActiveAssistant} />
      <ContentContainer>
        {showAssistants && (
          <Assistants
            activeAssistant={activeAssistant}
            setActiveAssistant={setActiveAssistant}
            onCreateAssistant={onCreateDefaultAssistant}
          />
        )}
        <Chat assistant={activeAssistant} activeTopic={activeTopic} setActiveTopic={onSetActiveTopic} />
      </ContentContainer>
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
`

const ContentContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: row;
  background-color: var(--color-background);
`

export default HomePage
