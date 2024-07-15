import { EVENT_NAMES, EventEmitter } from '@renderer/services/event'
import { Assistant, Message, Topic } from '@renderer/types'
import { uuid } from '@renderer/utils'
import { FC, useCallback, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { MoreOutlined } from '@ant-design/icons'
import { Button, Popconfirm, Tooltip } from 'antd'
import { useShowRightSidebar } from '@renderer/hooks/useStore'
import { useAssistant } from '@renderer/hooks/useAssistant'
import {
  ClearOutlined,
  FullscreenExitOutlined,
  FullscreenOutlined,
  HistoryOutlined,
  PauseCircleOutlined,
  PlusCircleOutlined
} from '@ant-design/icons'
import TextArea, { TextAreaRef } from 'antd/es/input/TextArea'
import { isEmpty } from 'lodash'
import SendMessageSetting from './SendMessageSetting'
import { useSettings } from '@renderer/hooks/useSettings'
import dayjs from 'dayjs'
import store, { useAppSelector } from '@renderer/store'
import { getDefaultTopic } from '@renderer/services/assistant'
import { useTranslation } from 'react-i18next'
import { setGenerating } from '@renderer/store/runtime'

interface Props {
  assistant: Assistant
  setActiveTopic: (topic: Topic) => void
}

const Inputbar: FC<Props> = ({ assistant, setActiveTopic }) => {
  const [text, setText] = useState('')
  const { setShowRightSidebar } = useShowRightSidebar()
  const { addTopic } = useAssistant(assistant.id)
  const { sendMessageShortcut } = useSettings()
  const [expended, setExpend] = useState(false)
  const generating = useAppSelector((state) => state.runtime.generating)
  const inputRef = useRef<TextAreaRef>(null)

  const { t } = useTranslation()

  const sendMessage = () => {
    if (generating) {
      return
    }

    if (isEmpty(text.trim())) {
      return
    }

    const message: Message = {
      id: uuid(),
      role: 'user',
      content: text,
      assistantId: assistant.id,
      topicId: assistant.topics[0].id || uuid(),
      createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      status: 'success'
    }

    EventEmitter.emit(EVENT_NAMES.SEND_MESSAGE, message)

    setText('')
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (sendMessageShortcut === 'Enter' && event.key === 'Enter') {
      if (event.shiftKey) {
        return
      }
      sendMessage()
      return event.preventDefault()
    }

    if (sendMessageShortcut === 'Shift+Enter' && event.key === 'Enter' && event.shiftKey) {
      sendMessage()
      return event.preventDefault()
    }
  }

  const addNewTopic = useCallback(() => {
    const topic: Topic = getDefaultTopic()
    addTopic(topic)
    setActiveTopic(topic)
  }, [addTopic, setActiveTopic])

  const clearTopic = () => EventEmitter.emit(EVENT_NAMES.CLEAR_MESSAGES)

  const onPause = () => {
    window.keyv.set(EVENT_NAMES.CHAT_COMPLETION_PAUSED, true)
    store.dispatch(setGenerating(false))
  }

  // Command or Ctrl + N create new topic
  useEffect(() => {
    const onKeydown = (e) => {
      if (!generating) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
          addNewTopic()
          inputRef.current?.focus()
        }
      }
    }
    document.addEventListener('keydown', onKeydown)
    return () => document.removeEventListener('keydown', onKeydown)
  }, [addNewTopic, generating])

  useEffect(() => {
    const unsubscribes = [
      EventEmitter.on(EVENT_NAMES.EDIT_MESSAGE, (message: Message) => {
        setText(message.content)
        inputRef.current?.focus()
      })
    ]
    return () => unsubscribes.forEach((unsub) => unsub())
  }, [])

  useEffect(() => {
    inputRef.current?.focus()
  }, [assistant])

  return (
    <Container id="inputbar" style={{ minHeight: expended ? '35%' : 'var(--input-bar-height)' }}>
      <Toolbar>
        <ToolbarMenu>
          <Tooltip placement="top" title={t('assistant.input.new_chat')} arrow>
            <ToolbarButton type="text" onClick={addNewTopic}>
              <PlusCircleOutlined />
            </ToolbarButton>
          </Tooltip>
          <Tooltip placement="top" title={t('assistant.input.topics')} arrow>
            <ToolbarButton type="text" onClick={setShowRightSidebar}>
              <HistoryOutlined />
            </ToolbarButton>
          </Tooltip>
          <Tooltip placement="top" title={t('assistant.input.clear')} arrow>
            <Popconfirm
              icon={false}
              title={t('assistant.input.clear.title')}
              description={t('assistant.input.clear.content')}
              placement="top"
              onConfirm={clearTopic}
              okText={t('assistant.input.clear')}>
              <ToolbarButton type="text">
                <ClearOutlined />
              </ToolbarButton>
            </Popconfirm>
          </Tooltip>
          <Tooltip placement="top" title={expended ? t('assistant.input.collapse') : t('assistant.input.expand')} arrow>
            <ToolbarButton type="text" onClick={() => setExpend(!expended)}>
              {expended ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
            </ToolbarButton>
          </Tooltip>
        </ToolbarMenu>
        <ToolbarMenu>
          {generating && (
            <Tooltip placement="top" title={t('assistant.input.pause')} arrow>
              <ToolbarButton type="text" onClick={onPause}>
                <PauseCircleOutlined />
              </ToolbarButton>
            </Tooltip>
          )}
          <SendMessageSetting>
            <ToolbarButton type="text" style={{ marginRight: 0 }}>
              <MoreOutlined />
            </ToolbarButton>
          </SendMessageSetting>
        </ToolbarMenu>
      </Toolbar>
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={t('assistant.input.placeholder')}
        autoFocus
        contextMenu="true"
        variant="borderless"
        styles={{ textarea: { paddingLeft: 0 } }}
        ref={inputRef}
      />
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: var(--input-bar-height);
  border-top: 0.5px solid var(--color-border);
  padding: 5px 15px;
  transition: all 0.3s ease;
`

const Textarea = styled(TextArea)`
  padding: 0;
  border-radius: 0;
  display: flex;
  flex: 1;
`

const Toolbar = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin: 0 -5px;
  margin-bottom: 5px;
`

const ToolbarMenu = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`

const ToolbarButton = styled(Button)`
  width: 32px;
  height: 32px;
  font-size: 18px;
  border-radius: 50%;
  transition: all 0.3s ease;
  margin-right: 6px;
  color: var(--color-icon);
  &.anticon {
    transition: all 0.3s ease;
    color: var(--color-icon);
  }
  &:hover {
    background-color: var(--color-background-soft);
    .anticon {
      color: white;
    }
  }
`

export default Inputbar
