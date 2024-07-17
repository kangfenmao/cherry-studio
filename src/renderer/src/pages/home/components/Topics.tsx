import PromptPopup from '@renderer/components/Popups/PromptPopup'
import { useAssistant } from '@renderer/hooks/useAssistant'
import { useShowRightSidebar } from '@renderer/hooks/useStore'
import { fetchMessagesSummary } from '@renderer/services/api'
import { Assistant, Topic } from '@renderer/types'
import { Button, Dropdown, MenuProps, Popconfirm } from 'antd'
import { FC, useRef } from 'react'
import styled from 'styled-components'
import { DeleteOutlined, EditOutlined, SignatureOutlined } from '@ant-design/icons'
import LocalStorage from '@renderer/services/storage'
import { DragDropContext, Draggable, Droppable, DropResult } from '@hello-pangea/dnd'
import { droppableReorder } from '@renderer/utils'
import { useTranslation } from 'react-i18next'

interface Props {
  assistant: Assistant
  activeTopic: Topic
  setActiveTopic: (topic: Topic) => void
}

const Topics: FC<Props> = ({ assistant, activeTopic, setActiveTopic }) => {
  const { showRightSidebar } = useShowRightSidebar()
  const { removeTopic, updateTopic, removeAllTopics, updateTopics } = useAssistant(assistant.id)
  const currentTopic = useRef<Topic | null>(null)
  const { t } = useTranslation()

  const topicMenuItems: MenuProps['items'] = [
    {
      label: t('assistant.topics.auto_rename'),
      key: 'auto-rename',
      icon: <SignatureOutlined />,
      async onClick() {
        if (currentTopic.current) {
          const messages = await LocalStorage.getTopicMessages(currentTopic.current.id)
          if (messages.length >= 2) {
            const summaryText = await fetchMessagesSummary({ messages, assistant })
            if (summaryText) {
              updateTopic({ ...currentTopic.current, name: summaryText })
            }
          }
        }
      }
    },
    {
      label: t('common.rename'),
      key: 'rename',
      icon: <EditOutlined />,
      async onClick() {
        const name = await PromptPopup.show({
          title: t('assistant.topics.edit.title'),
          message: t('assistant.topics.edit.placeholder'),
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
      label: t('common.delete'),
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

  const onDragEnd = (result: DropResult) => {
    if (result.destination) {
      const sourceIndex = result.source.index
      const destIndex = result.destination.index
      updateTopics(droppableReorder(assistant.topics, sourceIndex, destIndex))
    }
  }

  if (!showRightSidebar) {
    return null
  }

  return (
    <Container className={showRightSidebar ? '' : 'collapsed'}>
      <TopicTitle>
        <span>
          {t('assistant.topics.title')} ({assistant.topics.length})
        </span>
        <Popconfirm
          icon={false}
          title={t('assistant.topics.delete.all.title')}
          description={t('assistant.topics.delete.all.content')}
          placement="leftBottom"
          onConfirm={removeAllTopics}
          okType="danger">
          <DeleteButton type="text">
            <DeleteIcon />
          </DeleteButton>
        </Popconfirm>
      </TopicTitle>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="droppable">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {assistant.topics.map((topic, index) => (
                <Draggable key={`draggable_${topic.id}_${index}`} draggableId={topic.id} index={index}>
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                      <Dropdown
                        menu={{ items: topicMenuItems }}
                        trigger={['contextMenu']}
                        key={topic.id}
                        onOpenChange={(open) => open && (currentTopic.current = topic)}>
                        <TopicListItem
                          className={topic.id === activeTopic?.id ? 'active' : ''}
                          onClick={() => setActiveTopic(topic)}>
                          {topic.name}
                        </TopicListItem>
                      </Dropdown>
                    </div>
                  )}
                </Draggable>
              ))}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </Container>
  )
}

const Container = styled.div`
  width: var(--topic-list-width);
  height: 100%;
  border-left: 0.5px solid var(--color-border);
  padding: 10px;
  overflow-y: auto;
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
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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

export default Topics
