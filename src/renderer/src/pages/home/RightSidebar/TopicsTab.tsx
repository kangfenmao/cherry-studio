import { DeleteOutlined, EditOutlined, OpenAIOutlined } from '@ant-design/icons'
import { DragDropContext, Draggable, Droppable, DropResult } from '@hello-pangea/dnd'
import PromptPopup from '@renderer/components/Popups/PromptPopup'
import { useAssistant } from '@renderer/hooks/useAssistant'
import { fetchMessagesSummary } from '@renderer/services/api'
import LocalStorage from '@renderer/services/storage'
import { useAppSelector } from '@renderer/store'
import { Assistant, Topic } from '@renderer/types'
import { droppableReorder } from '@renderer/utils'
import { Dropdown, MenuProps } from 'antd'
import { FC, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

interface Props {
  assistant: Assistant
  activeTopic: Topic
  setActiveTopic: (topic: Topic) => void
}

const TopicsTab: FC<Props> = ({ assistant: _assistant, activeTopic, setActiveTopic }) => {
  const { assistant, removeTopic, updateTopic, updateTopics } = useAssistant(_assistant.id)
  const { t } = useTranslation()
  const generating = useAppSelector((state) => state.runtime.generating)

  const getTopicMenuItems = useCallback(
    (topic: Topic) => {
      const menus: MenuProps['items'] = [
        {
          label: t('chat.topics.auto_rename'),
          key: 'auto-rename',
          icon: <OpenAIOutlined />,
          async onClick() {
            const messages = await LocalStorage.getTopicMessages(topic.id)
            if (messages.length >= 2) {
              const summaryText = await fetchMessagesSummary({ messages, assistant })
              if (summaryText) {
                updateTopic({ ...topic, name: summaryText })
              }
            }
          }
        },
        {
          label: t('chat.topics.edit.title'),
          key: 'rename',
          icon: <EditOutlined />,
          async onClick() {
            const name = await PromptPopup.show({
              title: t('chat.topics.edit.title'),
              message: '',
              defaultValue: topic?.name || ''
            })
            if (name && topic?.name !== name) {
              updateTopic({ ...topic, name })
            }
          }
        }
      ]

      if (assistant.topics.length > 1) {
        menus.push({ type: 'divider' })
        menus.push({
          label: t('common.delete'),
          danger: true,
          key: 'delete',
          icon: <DeleteOutlined />,
          onClick() {
            if (assistant.topics.length === 1) return
            removeTopic(topic)
            setActiveTopic(assistant.topics[0])
          }
        })
      }

      return menus
    },
    [assistant, removeTopic, setActiveTopic, t, updateTopic]
  )

  const onDragEnd = useCallback(
    (result: DropResult) => {
      if (result.destination) {
        const sourceIndex = result.source.index
        const destIndex = result.destination.index
        updateTopics(droppableReorder(assistant.topics, sourceIndex, destIndex))
      }
    },
    [assistant.topics, updateTopics]
  )

  const onSwitchTopic = useCallback(
    (topic: Topic) => {
      if (generating) {
        window.message.warning({ content: t('message.switch.disabled'), key: 'switch-assistant' })
        return
      }
      setActiveTopic(topic)
    },
    [generating, setActiveTopic, t]
  )

  return (
    <Container>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="droppable">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {assistant.topics.map((topic, index) => (
                <Draggable key={`draggable_${topic.id}_${index}`} draggableId={topic.id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={{ ...provided.draggableProps.style, marginBottom: 5 }}>
                      <Dropdown menu={{ items: getTopicMenuItems(topic) }} trigger={['contextMenu']} key={topic.id}>
                        <TopicListItem
                          className={topic.id === activeTopic?.id ? 'active' : ''}
                          onClick={() => onSwitchTopic(topic)}>
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
  display: flex;
  flex: 1;
  flex-direction: column;
  padding: 10px 10px;
`

const TopicListItem = styled.div`
  padding: 7px 10px;
  cursor: pointer;
  border-radius: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: Ubuntu;
  &:hover {
    background-color: var(--color-background-soft);
  }
  &.active {
    background-color: var(--color-background-mute);
  }
`

export default TopicsTab
