import { ArrowRightOutlined, CopyOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons'
import { ArrowLeftOutlined } from '@ant-design/icons'
import DragableList from '@renderer/components/DragableList'
import { HStack } from '@renderer/components/Layout'
import AssistantSettingPopup from '@renderer/components/Popups/AssistantSettingPopup'
import { useAssistant, useAssistants } from '@renderer/hooks/useAssistant'
import { getDefaultTopic, syncAsistantToAgent } from '@renderer/services/assistant'
import { EVENT_NAMES, EventEmitter } from '@renderer/services/event'
import { useAppSelector } from '@renderer/store'
import { Assistant, Topic } from '@renderer/types'
import { uuid } from '@renderer/utils'
import { Dropdown } from 'antd'
import { ItemType } from 'antd/es/menu/interface'
import { last } from 'lodash'
import { FC, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import Topics from './Topics'

interface Props {
  activeAssistant: Assistant
  setActiveAssistant: (assistant: Assistant) => void
  activeTopic: Topic
  setActiveTopic: (topic: Topic) => void
  showTopics: boolean
  setShowTopics: (showTopics: boolean) => void
  onCreateAssistant: () => void
}

const Assistants: FC<Props> = ({
  activeAssistant,
  setActiveAssistant,
  activeTopic,
  setActiveTopic,
  showTopics,
  setShowTopics,
  onCreateAssistant
}) => {
  const { assistants, removeAssistant, addAssistant, updateAssistants } = useAssistants()
  const generating = useAppSelector((state) => state.runtime.generating)
  const { updateAssistant } = useAssistant(activeAssistant.id)
  const { t } = useTranslation()

  const onDelete = useCallback(
    (assistant: Assistant) => {
      const _assistant = last(assistants.filter((a) => a.id !== assistant.id))
      _assistant ? setActiveAssistant(_assistant) : onCreateAssistant()
      removeAssistant(assistant.id)
    },
    [assistants, onCreateAssistant, removeAssistant, setActiveAssistant]
  )

  const getMenuItems = useCallback(
    (assistant: Assistant) =>
      [
        {
          label: t('common.edit'),
          key: 'edit',
          icon: <EditOutlined />,
          async onClick() {
            const _assistant = await AssistantSettingPopup.show({ assistant })
            updateAssistant(_assistant)
            syncAsistantToAgent(_assistant)
          }
        },
        {
          label: t('common.duplicate'),
          key: 'duplicate',
          icon: <CopyOutlined />,
          onClick: async () => {
            const _assistant: Assistant = { ...assistant, id: uuid(), topics: [getDefaultTopic()] }
            addAssistant(_assistant)
            setActiveAssistant(_assistant)
          }
        },
        { type: 'divider' },
        {
          label: t('common.delete'),
          key: 'delete',
          icon: <DeleteOutlined />,
          danger: true,
          onClick: () => onDelete(assistant)
        }
      ] as ItemType[],
    [addAssistant, onDelete, setActiveAssistant, t, updateAssistant]
  )

  const onSwitchAssistant = useCallback(
    (assistant: Assistant): any => {
      if (generating) {
        return window.message.warning({
          content: t('message.switch.disabled'),
          key: 'switch-assistant'
        })
      }
      EventEmitter.emit(EVENT_NAMES.SWITCH_TOPIC_SIDEBAR)
      setActiveAssistant(assistant)
      setShowTopics(true)
    },
    [generating, setActiveAssistant, setShowTopics, t]
  )

  if (showTopics) {
    return (
      <Container>
        <NavigtaionHeader onClick={() => setShowTopics(false)}>
          <ArrowLeftOutlined />
          {t('common.back')}
        </NavigtaionHeader>
        <Topics assistant={activeAssistant} activeTopic={activeTopic} setActiveTopic={setActiveTopic} />
      </Container>
    )
  }

  return (
    <Container>
      <DragableList list={assistants} onUpdate={updateAssistants}>
        {(assistant) => (
          <Dropdown key={assistant.id} menu={{ items: getMenuItems(assistant) }} trigger={['contextMenu']}>
            <AssistantItem
              onClick={() => onSwitchAssistant(assistant)}
              className={assistant.id === activeAssistant?.id ? 'active' : ''}>
              <AssistantName className="name">{assistant.name || t('chat.default.name')}</AssistantName>
              <HStack alignItems="center">
                <ArrowRightOutlined />
              </HStack>
            </AssistantItem>
          </Dropdown>
        )}
      </DragableList>
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-width: var(--assistants-width);
  max-width: var(--assistants-width);
  border-right: 0.5px solid var(--color-border);
  height: calc(100vh - var(--navbar-height));
  overflow-y: auto;
  padding: 10px 0;
`

const AssistantItem = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 7px 10px;
  position: relative;
  border-radius: 4px;
  margin: 0 10px;
  cursor: pointer;
  font-family: Ubuntu;
  .anticon {
    display: none;
    color: var(--color-text-3);
  }
  &:hover {
    background-color: var(--color-background-soft);
    .count {
      display: none;
    }
    .anticon {
      display: block;
    }
  }
  &.active {
    background-color: var(--color-background-mute);
    cursor: pointer;
    .name {
      font-weight: 500;
    }
  }
`

const NavigtaionHeader = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
  padding: 0 5px;
  cursor: pointer;
  color: var(--color-text-3);
  margin: 10px;
  margin-top: 0;
`

const AssistantName = styled.div`
  color: var(--color-text);
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
`

export default Assistants
