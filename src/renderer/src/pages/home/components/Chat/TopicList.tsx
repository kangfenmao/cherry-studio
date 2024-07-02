import PromptPopup from '@renderer/components/Popups/PromptPopup'
import { useAgent } from '@renderer/hooks/useAgents'
import { useShowRightSidebar } from '@renderer/hooks/useStore'
import { fetchConversationSummary } from '@renderer/services/api'
import { getTopicMessages } from '@renderer/services/topic'
import { Agent, Topic } from '@renderer/types'
import { Dropdown, MenuProps } from 'antd'
import { FC, useRef } from 'react'
import styled from 'styled-components'

interface Props {
  agent: Agent
  activeTopic: Topic
  setActiveTopic: (topic: Topic) => void
}

const TopicList: FC<Props> = ({ agent, activeTopic, setActiveTopic }) => {
  const { showRightSidebar } = useShowRightSidebar()
  const { removeTopic, updateTopic } = useAgent(agent.id)
  const currentTopic = useRef<Topic | null>(null)

  const items: MenuProps['items'] = [
    {
      label: 'AI Rename',
      key: 'ai-rename',
      async onClick() {
        if (currentTopic.current) {
          const messages = await getTopicMessages(currentTopic.current.id)
          if (messages.length >= 2) {
            const summaryText = await fetchConversationSummary({ messages })
            if (summaryText) {
              updateTopic({ ...currentTopic.current, name: summaryText })
            }
          }
        }
      }
    },
    {
      label: 'Rename',
      key: 'rename',
      async onClick() {
        const name = await PromptPopup.show({
          title: 'Rename Topic',
          message: 'Please enter the new name',
          defaultValue: currentTopic.current?.name || ''
        })
        if (name && currentTopic.current && currentTopic.current?.name !== name) {
          updateTopic({ ...currentTopic.current, name })
        }
      }
    }
  ]

  if (agent.topics.length > 1) {
    items.push({ type: 'divider' })
    items.push({
      label: 'Delete',
      danger: true,
      key: 'delete',
      onClick() {
        if (agent.topics.length === 1) return
        currentTopic.current && removeTopic(currentTopic.current)
        currentTopic.current = null
        setActiveTopic(agent.topics[0])
      }
    })
  }

  if (!showRightSidebar) {
    return null
  }

  return (
    <Container className={showRightSidebar ? '' : 'collapsed'}>
      <TopicTitle>Topics ({agent.topics.length})</TopicTitle>
      {agent.topics.map((topic) => (
        <Dropdown
          menu={{ items }}
          trigger={['contextMenu']}
          key={topic.id}
          onOpenChange={(open) => open && (currentTopic.current = topic)}>
          <TopicListItem className={topic.id === activeTopic?.id ? 'active' : ''} onClick={() => setActiveTopic(topic)}>
            {topic.name}
          </TopicListItem>
        </Dropdown>
      ))}
    </Container>
  )
}

const Container = styled.div`
  width: var(--topic-list-width);
  height: 100%;
  border-left: 0.5px solid var(--color-border);
  padding: 10px;
  &.collapsed {
    width: 0;
    border-left: none;
  }
`

const TopicListItem = styled.div`
  padding: 8px 10px;
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

const TopicTitle = styled.div`
  font-weight: bold;
  margin-bottom: 10px;
  font-size: 14px;
  color: var(--color-text-1);
`

export default TopicList
