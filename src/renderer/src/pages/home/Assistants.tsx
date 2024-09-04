import { CopyOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons'
import DragableList from '@renderer/components/DragableList'
import AssistantSettingPopup from '@renderer/components/Popups/AssistantSettingPopup'
import { useAssistant, useAssistants } from '@renderer/hooks/useAssistant'
import { useShowTopics } from '@renderer/hooks/useStore'
import { getDefaultTopic, syncAsistantToAgent } from '@renderer/services/assistant'
import { EVENT_NAMES, EventEmitter } from '@renderer/services/event'
import { useAppSelector } from '@renderer/store'
import { Assistant } from '@renderer/types'
import { uuid } from '@renderer/utils'
import { Dropdown } from 'antd'
import { ItemType } from 'antd/es/menu/interface'
import { last } from 'lodash'
import { FC, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

interface Props {
  activeAssistant: Assistant
  setActiveAssistant: (assistant: Assistant) => void
  onCreateAssistant: () => void
}

const Assistants: FC<Props> = ({ activeAssistant, setActiveAssistant, onCreateAssistant }) => {
  const { assistants, removeAssistant, addAssistant, updateAssistants } = useAssistants()
  const generating = useAppSelector((state) => state.runtime.generating)
  const { updateAssistant } = useAssistant(activeAssistant.id)
  const { toggleShowTopics } = useShowTopics()
  const { t } = useTranslation()

  const onDelete = useCallback(
    (assistant: Assistant) => {
      const _assistant = last(assistants.filter((a) => a.id !== assistant.id))
      _assistant ? setActiveAssistant(_assistant) : onCreateAssistant()
      removeAssistant(assistant.id)
    },
    [assistants, onCreateAssistant, removeAssistant, setActiveAssistant]
  )

  const onEditAssistant = useCallback(
    async (assistant: Assistant) => {
      const _assistant = await AssistantSettingPopup.show({ assistant })
      updateAssistant(_assistant)
      syncAsistantToAgent(_assistant)
    },
    [updateAssistant]
  )

  const getMenuItems = useCallback(
    (assistant: Assistant) =>
      [
        {
          label: t('common.edit'),
          key: 'edit',
          icon: <EditOutlined />,
          onClick: () => onEditAssistant(assistant)
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
    [addAssistant, onDelete, onEditAssistant, setActiveAssistant, t]
  )

  const onSwitchAssistant = useCallback(
    (assistant: Assistant): any => {
      if (generating) {
        return window.message.warning({
          content: t('message.switch.disabled'),
          key: 'switch-assistant'
        })
      }

      if (assistant.id === activeAssistant?.id) {
        toggleShowTopics()
      }

      EventEmitter.emit(EVENT_NAMES.SWITCH_TOPIC_SIDEBAR)
      setActiveAssistant(assistant)
    },
    [activeAssistant?.id, generating, setActiveAssistant, t, toggleShowTopics]
  )

  return (
    <Container>
      <DragableList list={assistants} onUpdate={updateAssistants}>
        {(assistant) => (
          <Dropdown key={assistant.id} menu={{ items: getMenuItems(assistant) }} trigger={['contextMenu']}>
            <AssistantItem
              onClick={() => onSwitchAssistant(assistant)}
              className={assistant.id === activeAssistant?.id ? 'active' : ''}>
              <AssistantName className="name">{assistant.name || t('chat.default.name')}</AssistantName>
              <ArrowRightButton className="arrow-button">
                <i className="iconfont icon-gridlines" />
              </ArrowRightButton>
              {false && <TopicCount className="topics-count">{assistant.topics.length}</TopicCount>}
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
  padding-top: 10px;
  padding-bottom: 10px;
`

const AssistantItem = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 7px 10px;
  position: relative;
  border-radius: 4px;
  margin: 0 10px;
  padding-right: 35px;
  cursor: pointer;
  font-family: Ubuntu;
  .iconfont {
    opacity: 0;
    color: var(--color-text-3);
  }
  &:hover {
    background-color: var(--color-background-soft);
    .topics-count {
      display: none;
    }
    .iconfont {
      opacity: 1;
    }
  }
  &.active {
    background-color: var(--color-background-mute);
    .topics-count {
      display: none;
    }
    .iconfont {
      opacity: 1;
      color: var(--color-text-2);
    }
  }
`

const AssistantName = styled.div`
  color: var(--color-text);
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-size: 13px;
`

const ArrowRightButton = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  transition: all 0.2s ease;
  width: 24px;
  height: 24px;
  min-width: 24px;
  min-height: 24px;
  border-radius: 4px;
  position: absolute;
  right: 10px;
  top: 5px;
  .anticon {
    font-size: 14px;
  }
  &:hover {
    background-color: var(--color-background);
  }
`

const TopicCount = styled.div`
  color: var(--color-text-3);
  font-size: 12px;
  margin-right: 3px;
  background-color: var(--color-background-mute);
  opacity: 0.8;
  width: 20px;
  height: 20px;
  border-radius: 10px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
`

export default Assistants
