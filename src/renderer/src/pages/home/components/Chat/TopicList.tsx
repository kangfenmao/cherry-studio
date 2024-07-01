import { useShowRightSidebar } from '@renderer/hooks/useStore'
import { Agent, Topic } from '@renderer/types'
import { FC } from 'react'
import styled from 'styled-components'

interface Props {
  agent: Agent
  activeTopic: Topic
  setActiveTopic: (topic: Topic) => void
}

const TopicList: FC<Props> = ({ agent, activeTopic, setActiveTopic }) => {
  const { showRightSidebar } = useShowRightSidebar()

  if (!showRightSidebar) {
    return null
  }

  return (
    <Container className={showRightSidebar ? '' : 'collapsed'}>
      {agent.topics.map((topic) => (
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
