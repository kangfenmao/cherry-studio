import { DeleteOutlined, EditOutlined, OpenAIOutlined } from '@ant-design/icons'
import DragableList from '@renderer/components/DragableList'
import PromptPopup from '@renderer/components/Popups/PromptPopup'
import { useAssistant } from '@renderer/hooks/useAssistant'
import { fetchMessagesSummary } from '@renderer/services/api'
import LocalStorage from '@renderer/services/storage'
import { useAppSelector } from '@renderer/store'
import { Assistant, Topic } from '@renderer/types'
import { Button, Dropdown, MenuProps } from 'antd'
import { take } from 'lodash'
import { FC, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

interface Props {
  assistant: Assistant
  activeTopic: Topic
  setActiveTopic: (topic: Topic) => void
}

const Topics: FC<Props> = ({ assistant: _assistant, activeTopic, setActiveTopic }) => {
  const { assistant, removeTopic, updateTopic, updateTopics } = useAssistant(_assistant.id)
  const [showAll, setShowAll] = useState(false)
  const [draging, setDraging] = useState(false)
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
      <DragableList
        list={take(assistant.topics, showAll ? assistant.topics.length : 15)}
        onUpdate={updateTopics}
        onDragStart={() => setDraging(true)}
        onDragEnd={() => setDraging(false)}>
        {(topic) => {
          const isActive = topic.id === activeTopic?.id
          return (
            <Dropdown menu={{ items: getTopicMenuItems(topic) }} trigger={['contextMenu']} key={topic.id}>
              <TopicListItem className={isActive ? 'active' : ''} onClick={() => onSwitchTopic(topic)}>
                {topic.name}
              </TopicListItem>
            </Dropdown>
          )
        }}
      </DragableList>
      {!draging && assistant.topics.length > 15 && (
        <Footer>
          <Button type="link" onClick={() => setShowAll(!showAll)}>
            {showAll ? t('button.collapse') : t('button.show.all')}
          </Button>
        </Footer>
      )}
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  padding-top: 10px;
  overflow-y: scroll;
  height: calc(100vh - var(--navbar-height));
`

const TopicListItem = styled.div`
  padding: 7px 10px;
  margin: 0 10px;
  cursor: pointer;
  border-radius: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: Ubuntu;
  font-size: 13px;
  &:hover {
    background-color: var(--color-background-soft);
  }
  &.active {
    background-color: var(--color-background-mute);
    font-weight: 500;
  }
`

const Footer = styled.div`
  margin: 0 4px;
  margin-bottom: 10px;
`

export default Topics
