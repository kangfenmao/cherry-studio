import { useShowRightSidebar } from '@renderer/hooks/useStore'
import { Agent } from '@renderer/types'
import { FC, useEffect, useState } from 'react'
import styled from 'styled-components'

interface Props {
  agent: Agent
}

const TopicList: FC<Props> = ({ agent }) => {
  const { showRightSidebar } = useShowRightSidebar()
  const [activeTopic, setActiveTopic] = useState(agent.conversations[0])

  useEffect(() => {
    setActiveTopic(agent.conversations[0])
  }, [agent.conversations, agent.id])

  if (!showRightSidebar) {
    return null
  }

  return (
    <Container className={showRightSidebar ? '' : 'collapsed'}>
      {agent.conversations.map((topic) => (
        <TopicListItem
          key={topic.id}
          className={topic.id === activeTopic?.id ? 'active' : ''}
          onClick={() => setActiveTopic(topic)}>
          {topic.name}
        </TopicListItem>
      ))}
    </Container>
  )
}

const Container = styled.div`
  width: var(--topic-list-width);
  height: 100%;
  border-left: 0.5px solid #ffffff20;
  padding: 10px;
  &.collapsed {
    width: 0;
    border-left: none;
  }
`

const TopicListItem = styled.div`
  padding: 8px 15px;
  margin-bottom: 5px;
  cursor: pointer;
  border-radius: 5px;
  font-size: 13px;
  &:hover {
    background-color: var(--color-background-soft);
  }
  &.active {
    background-color: var(--color-background-soft);
  }
`

export default TopicList
