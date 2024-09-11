import { DeleteOutlined, EditOutlined, MinusCircleOutlined } from '@ant-design/icons'
import DragableList from '@renderer/components/DragableList'
import CopyIcon from '@renderer/components/Icons/CopyIcon'
import AssistantSettingPopup from '@renderer/components/Popups/AssistantSettingPopup'
import { useAssistant, useAssistants } from '@renderer/hooks/useAssistant'
import { getDefaultTopic, syncAsistantToAgent } from '@renderer/services/assistant'
import { EVENT_NAMES, EventEmitter } from '@renderer/services/event'
import { useAppDispatch, useAppSelector } from '@renderer/store'
import { setSearching } from '@renderer/store/runtime'
import { Assistant } from '@renderer/types'
import { uuid } from '@renderer/utils'
import { Dropdown, Input, InputRef } from 'antd'
import { ItemType } from 'antd/es/menu/interface'
import { isEmpty, last } from 'lodash'
import { FC, useCallback, useEffect, useRef, useState } from 'react'
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
  const [search, setSearch] = useState('')
  const { updateAssistant, removeAllTopics } = useAssistant(activeAssistant.id)
  const searchRef = useRef<InputRef>(null)
  const { t } = useTranslation()
  const dispatch = useAppDispatch()

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
          icon: <CopyIcon />,
          onClick: async () => {
            const _assistant: Assistant = { ...assistant, id: uuid(), topics: [getDefaultTopic()] }
            addAssistant(_assistant)
            setActiveAssistant(_assistant)
          }
        },
        {
          label: t('chat.topics.delete.all.title'),
          key: 'delete-all',
          icon: <MinusCircleOutlined />,
          onClick: () => {
            window.modal.confirm({
              title: t('chat.topics.delete.all.title'),
              content: t('chat.topics.delete.all.content'),
              centered: true,
              okButtonProps: { danger: true },
              onOk: removeAllTopics
            })
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
    [addAssistant, onDelete, onEditAssistant, removeAllTopics, setActiveAssistant, t]
  )

  const onSwitchAssistant = useCallback(
    (assistant: Assistant): any => {
      if (generating) {
        return window.message.warning({
          content: t('message.switch.disabled'),
          key: 'switch-assistant'
        })
      }

      setActiveAssistant(assistant)
    },
    [generating, setActiveAssistant, t]
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
            style={{ borderRadius: 4, borderWidth: 0.5 }}
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
      <DragableList list={list} onUpdate={updateAssistants} droppableProps={{ isDropDisabled: !isEmpty(search) }}>
        {(assistant) => {
          const isCurrent = assistant.id === activeAssistant?.id
          return (
            <Dropdown key={assistant.id} menu={{ items: getMenuItems(assistant) }} trigger={['contextMenu']}>
              <AssistantItem onClick={() => onSwitchAssistant(assistant)} className={isCurrent ? 'active' : ''}>
                <AssistantName className="name">{assistant.name || t('chat.default.name')}</AssistantName>
                <ArrowRightButton
                  className={`arrow-button ${isCurrent ? 'active' : ''}`}
                  onClick={() => EventEmitter.emit(EVENT_NAMES.SWITCH_TOPIC_SIDEBAR)}>
                  <i className="iconfont icon-gridlines" />
                </ArrowRightButton>
                {false && <TopicCount className="topics-count">{assistant.topics.length}</TopicCount>}
              </AssistantItem>
            </Dropdown>
          )
        }}
      </DragableList>
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
  &.active {
    background-color: var(--color-background-mute);
    .name {
      font-weight: 500;
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
