import PromptPopup from '@renderer/components/Popups/PromptPopup'
import { useAssistant } from '@renderer/hooks/useAssistant'
import { useShowRightSidebar } from '@renderer/hooks/useStore'
import { fetchConversationSummary } from '@renderer/services/api'
import { Assistant, Topic } from '@renderer/types'
import { Button, Dropdown, MenuProps, Popconfirm } from 'antd'
import { FC, useRef } from 'react'
import styled from 'styled-components'
import { DeleteOutlined, EditOutlined, SignatureOutlined } from '@ant-design/icons'
import LocalStorage from '@renderer/services/storage'

interface Props {
  assistant: Assistant
  activeTopic: Topic
  setActiveTopic: (topic: Topic) => void
}

const TopicList: FC<Props> = ({ assistant, activeTopic, setActiveTopic }) => {
  const { showRightSidebar } = useShowRightSidebar()
  const { removeTopic, updateTopic, removeAllTopics } = useAssistant(assistant.id)
  const currentTopic = useRef<Topic | null>(null)

  const topicMenuItems: MenuProps['items'] = [
    {
      label: 'Auto Rename',
      key: 'auto-rename',
      icon: <SignatureOutlined />,
      async onClick() {
        if (currentTopic.current) {
          const messages = await LocalStorage.getTopicMessages(currentTopic.current.id)
          if (messages.length >= 2) {
            const summaryText = await fetchConversationSummary({ messages, assistant })
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
      icon: <EditOutlined />,
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

  if (assistant.topics.length > 1) {
    topicMenuItems.push({ type: 'divider' })
    topicMenuItems.push({
      label: 'Delete',
      danger: true,
      key: 'delete',
      icon: <DeleteOutlined />,
      onClick() {
        if (assistant.topics.length === 1) return
        currentTopic.current && removeTopic(currentTopic.current)
        currentTopic.current = null
        setActiveTopic(assistant.topics[0])
      }
    })
  }

  if (!showRightSidebar) {
    return null
  }

  return (
    <Container className={showRightSidebar ? '' : 'collapsed'}>
      <TopicTitle>
        <span>Topics ({assistant.topics.length})</span>
        <Popconfirm
          icon={false}
          title="Delete all topic?"
          description="Are you sure to delete all topics?"
          placement="leftBottom"
          onConfirm={removeAllTopics}
          okText="Delete All"
          okType="danger"
          cancelText="Cancel">
          <DeleteButton type="text">
            <DeleteIcon />
          </DeleteButton>
        </Popconfirm>
      </TopicTitle>
      {assistant.topics.map((topic) => (
        <Dropdown
          menu={{ items: topicMenuItems }}
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
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`

const DeleteButton = styled(Button)`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  padding: 0;
  &:hover {
    .anticon {
      color: #ff4d4f;
    }
  }
`

const DeleteIcon = styled(DeleteOutlined)`
  font-size: 16px;
`

export default TopicList
