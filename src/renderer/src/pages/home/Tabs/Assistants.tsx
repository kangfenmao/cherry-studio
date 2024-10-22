import { DeleteOutlined, EditOutlined, MinusCircleOutlined, PlusOutlined, SaveOutlined } from '@ant-design/icons'
import AssistantSettingsPopup from '@renderer/components/AssistantSettings'
import DragableList from '@renderer/components/DragableList'
import CopyIcon from '@renderer/components/Icons/CopyIcon'
import { useAgents } from '@renderer/hooks/useAgents'
import { useAssistant, useAssistants } from '@renderer/hooks/useAssistant'
import { useSettings } from '@renderer/hooks/useSettings'
import { getDefaultTopic } from '@renderer/services/assistant'
import { EVENT_NAMES, EventEmitter } from '@renderer/services/event'
import { useAppDispatch, useAppSelector } from '@renderer/store'
import { setSearching } from '@renderer/store/runtime'
import { Assistant } from '@renderer/types'
import { uuid } from '@renderer/utils'
import { Dropdown, Input, InputRef } from 'antd'
import { ItemType } from 'antd/es/menu/interface'
import { isEmpty, last, omit } from 'lodash'
import { FC, useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

interface Props {
  activeAssistant: Assistant
  setActiveAssistant: (assistant: Assistant) => void
  onCreateDefaultAssistant: () => void
  onCreateAssistant: () => void
}

const Assistants: FC<Props> = ({
  activeAssistant,
  setActiveAssistant,
  onCreateAssistant,
  onCreateDefaultAssistant
}) => {
  const { assistants, removeAssistant, addAssistant, updateAssistants } = useAssistants()
  const generating = useAppSelector((state) => state.runtime.generating)
  const [search, setSearch] = useState('')
  const [dragging, setDragging] = useState(false)
  const { removeAllTopics } = useAssistant(activeAssistant.id)
  const { clickAssistantToShowTopic, topicPosition } = useSettings()
  const searchRef = useRef<InputRef>(null)
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const { addAgent } = useAgents()

  const onDelete = useCallback(
    (assistant: Assistant) => {
      const _assistant = last(assistants.filter((a) => a.id !== assistant.id))
      _assistant ? setActiveAssistant(_assistant) : onCreateDefaultAssistant()
      removeAssistant(assistant.id)
    },
    [assistants, onCreateDefaultAssistant, removeAssistant, setActiveAssistant]
  )

  const getMenuItems = useCallback(
    (assistant: Assistant) =>
      [
        {
          label: t('assistants.edit.title'),
          key: 'edit',
          icon: <EditOutlined />,
          onClick: () => AssistantSettingsPopup.show({ assistant })
        },
        {
          label: t('assistants.copy.title'),
          key: 'duplicate',
          icon: <CopyIcon />,
          onClick: async () => {
            const _assistant: Assistant = { ...assistant, id: uuid(), topics: [getDefaultTopic(assistant.id)] }
            addAssistant(_assistant)
            setActiveAssistant(_assistant)
          }
        },
        {
          label: t('assistants.clear.title'),
          key: 'clear',
          icon: <MinusCircleOutlined />,
          onClick: () => {
            window.modal.confirm({
              title: t('assistants.clear.title'),
              content: t('assistants.clear.content'),
              centered: true,
              okButtonProps: { danger: true },
              onOk: removeAllTopics
            })
          }
        },
        {
          label: t('assistants.save.title'),
          key: 'save-to-agent',
          icon: <SaveOutlined />,
          onClick: async () => {
            const agent = omit(assistant, ['model', 'emoji'])
            agent.id = uuid()
            agent.type = 'agent'
            addAgent(agent)
            window.message.success({
              content: t('assistants.save.success'),
              key: 'save-to-agent'
            })
          }
        },
        { type: 'divider' },
        {
          label: t('common.delete'),
          key: 'delete',
          icon: <DeleteOutlined />,
          danger: true,
          onClick: () => {
            window.modal.confirm({
              title: t('assistants.delete.title'),
              content: t('assistants.delete.content'),
              centered: true,
              okButtonProps: { danger: true },
              onOk: () => onDelete(assistant)
            })
          }
        }
      ] as ItemType[],
    [addAgent, addAssistant, onDelete, removeAllTopics, setActiveAssistant, t]
  )

  const onSwitchAssistant = useCallback(
    (assistant: Assistant): any => {
      if (generating) {
        return window.message.warning({
          content: t('message.switch.disabled'),
          key: 'switch-assistant'
        })
      }

      if (topicPosition === 'left' && clickAssistantToShowTopic) {
        EventEmitter.emit(EVENT_NAMES.SWITCH_TOPIC_SIDEBAR)
      }

      setActiveAssistant(assistant)
    },
    [clickAssistantToShowTopic, generating, setActiveAssistant, t, topicPosition]
  )

  const list = assistants.filter((assistant) => assistant.name?.toLowerCase().includes(search.toLowerCase().trim()))

  const onSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const isEnterPressed = e.keyCode == 13

    if (e.key === 'Escape') {
      return searchRef.current?.blur()
    }

    if (isEnterPressed) {
      if (list.length > 0) {
        if (list.length === 1) {
          onSwitchAssistant(list[0])
          setSearch('')
          setTimeout(() => searchRef.current?.blur(), 0)
          return
        }
        const index = list.findIndex((a) => a.id === activeAssistant?.id)
        onSwitchAssistant(index === list.length - 1 ? list[0] : list[index + 1])
      }
    }

    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      searchRef.current?.focus()
      searchRef.current?.select()
    }
  }

  // Command or Ctrl + K create new topic
  useEffect(() => {
    const onKeydown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        searchRef.current?.focus()
        searchRef.current?.select()
      }
    }
    document.addEventListener('keydown', onKeydown)
    return () => document.removeEventListener('keydown', onKeydown)
  }, [activeAssistant?.id, list, onSwitchAssistant])

  return (
    <Container>
      {assistants.length >= 10 && (
        <SearchContainer>
          <Input
            placeholder={t('chat.assistant.search.placeholder')}
            suffix={<CommandKey>⌘+K</CommandKey>}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ borderRadius: 16, borderWidth: 0.5 }}
            onKeyDown={onSearch}
            ref={searchRef}
            onFocus={() => dispatch(setSearching(true))}
            onBlur={() => {
              dispatch(setSearching(false))
              setSearch('')
            }}
            allowClear
          />
        </SearchContainer>
      )}
      <DragableList
        list={list}
        onUpdate={updateAssistants}
        droppableProps={{ isDropDisabled: !isEmpty(search) }}
        style={{ paddingBottom: dragging ? '34px' : 0 }}
        onDragStart={() => setDragging(true)}
        onDragEnd={() => setDragging(false)}>
        {(assistant) => {
          const isCurrent = assistant.id === activeAssistant?.id
          return (
            <Dropdown key={assistant.id} menu={{ items: getMenuItems(assistant) }} trigger={['contextMenu']}>
              <AssistantItem onClick={() => onSwitchAssistant(assistant)} className={isCurrent ? 'active' : ''}>
                <AssistantName className="name">{assistant.name || t('chat.default.name')}</AssistantName>
                {isCurrent && (
                  <ArrowRightButton onClick={() => EventEmitter.emit(EVENT_NAMES.SWITCH_TOPIC_SIDEBAR)}>
                    <i className="iconfont icon-gridlines" />
                  </ArrowRightButton>
                )}
                {false && <TopicCount className="topics-count">{assistant.topics.length}</TopicCount>}
              </AssistantItem>
            </Dropdown>
          )
        }}
      </DragableList>
      {!dragging && (
        <AssistantItem onClick={onCreateAssistant}>
          <AssistantName>
            <PlusOutlined style={{ color: 'var(--color-text-2)', marginRight: 4 }} />
            {t('chat.add.assistant.title')}
          </AssistantName>
        </AssistantItem>
      )}
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100vh - var(--navbar-height));
  overflow-y: auto;
  padding-top: 10px;
  padding-bottom: 10px;
`

const AssistantItem = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 7px 12px;
  position: relative;
  border-radius: 17px;
  margin: 0 10px;
  padding-right: 35px;
  font-family: Ubuntu;
  cursor: pointer;
  .iconfont {
    opacity: 0;
    color: var(--color-text-3);
  }
  &:hover {
    background-color: var(--color-background-soft);
  }
  &.active {
    background-color: var(--color-background-mute);
    .name {
    }
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
  width: 22px;
  height: 22px;
  min-width: 22px;
  min-height: 22px;
  border-radius: 4px;
  position: absolute;
  background-color: var(--color-background);
  right: 9px;
  top: 6px;
  .iconfont {
    font-size: 12px;
  }
`

const TopicCount = styled.div`
  color: var(--color-text-2);
  font-size: 10px;
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

const SearchContainer = styled.div`
  margin: 0 10px;
  margin-bottom: 10px;
`

const CommandKey = styled.div`
  color: var(--color-text-2);
  font-size: 10px;
  padding: 2px 5px;
  border-radius: 4px;
  background-color: var(--color-background);
  margin-right: -4px;
`

export default Assistants
