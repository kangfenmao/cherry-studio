import { CloseOutlined, DeleteOutlined, EditOutlined, OpenAIOutlined } from '@ant-design/icons'
import DragableList from '@renderer/components/DragableList'
import PromptPopup from '@renderer/components/Popups/PromptPopup'
import { useAssistant } from '@renderer/hooks/useAssistant'
import { fetchMessagesSummary } from '@renderer/services/api'
import LocalStorage from '@renderer/services/storage'
import { useAppSelector } from '@renderer/store'
import { Assistant, Topic } from '@renderer/types'
import { Button, Dropdown, MenuProps } from 'antd'
import { findIndex, take } from 'lodash'
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

  const onDeleteTopic = useCallback(
    (topic: Topic) => {
      if (assistant.topics.length > 1) {
        const index = findIndex(assistant.topics, (t) => t.id === topic.id)
        setActiveTopic(assistant.topics[index + 1 === assistant.topics.length ? 0 : index + 1])
        removeTopic(topic)
      }
    },
    [assistant.topics, removeTopic, setActiveTopic]
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
          onClick: () => onDeleteTopic(topic)
        })
      }

      return menus
    },
    [assistant, onDeleteTopic, t, updateTopic]
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
                <TopicName>{topic.name}</TopicName>
                {assistant.topics.length > 1 && (
                  <MenuButton
                    className="menu"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeleteTopic(topic)
                    }}>
                    <CloseOutlined />
                  </MenuButton>
                )}
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
  font-family: Ubuntu;
  font-size: 13px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  position: relative;
  .menu {
    opacity: 0;
    color: var(--color-text-3);
  }
  &.active {
    background-color: var(--color-background-mute);
    font-weight: 500;
    .menu {
      opacity: 1;
      background-color: var(--color-background-mute);
      &:hover {
        color: var(--color-text-2);
      }
    }
  }
`

const TopicName = styled.div`
  color: var(--color-text);
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-size: 13px;
`

const MenuButton = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: 30px;
  height: 24px;
  min-width: 24px;
  min-height: 24px;
  border-radius: 4px;
  position: absolute;
  right: 10px;
  top: 5px;
  .anticon {
    font-size: 12px;
  }
`

const Footer = styled.div`
  margin: 0 4px;
  margin-bottom: 10px;
`

export default Topics
