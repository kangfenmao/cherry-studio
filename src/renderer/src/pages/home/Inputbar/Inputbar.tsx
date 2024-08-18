import {
  ClearOutlined,
  ControlOutlined,
  FullscreenExitOutlined,
  FullscreenOutlined,
  HistoryOutlined,
  PauseCircleOutlined,
  PlusCircleOutlined,
  QuestionCircleOutlined
} from '@ant-design/icons'
import { DEFAULT_CONEXTCOUNT } from '@renderer/config/constant'
import { useAssistant } from '@renderer/hooks/useAssistant'
import { useSettings } from '@renderer/hooks/useSettings'
import { getDefaultTopic } from '@renderer/services/assistant'
import { EVENT_NAMES, EventEmitter } from '@renderer/services/event'
import { estimateInputTokenCount } from '@renderer/services/messages'
import store, { useAppSelector } from '@renderer/store'
import { setGenerating } from '@renderer/store/runtime'
import { Assistant, Message, Topic } from '@renderer/types'
import { delay, uuid } from '@renderer/utils'
import { Button, Divider, Popconfirm, Tag, Tooltip } from 'antd'
import TextArea, { TextAreaRef } from 'antd/es/input/TextArea'
import dayjs from 'dayjs'
import { debounce, isEmpty } from 'lodash'
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import SendMessageButton from './SendMessageButton'

interface Props {
  assistant: Assistant
  setActiveTopic: (topic: Topic) => void
}

let _text = ''

const Inputbar: FC<Props> = ({ assistant, setActiveTopic }) => {
  const [text, setText] = useState(_text)
  const [inputFocus, setInputFocus] = useState(false)
  const { addTopic } = useAssistant(assistant.id)
  const { sendMessageShortcut, showInputEstimatedTokens, fontSize } = useSettings()
  const [expended, setExpend] = useState(false)
  const [estimateTokenCount, setEstimateTokenCount] = useState(0)
  const generating = useAppSelector((state) => state.runtime.generating)
  const inputRef = useRef<TextAreaRef>(null)
  const { t } = useTranslation()

  _text = text

  const sendMessage = useCallback(() => {
    if (generating) {
      return
    }

    if (isEmpty(text.trim())) {
      return
    }

    const message: Message = {
      id: uuid(),
      role: 'user',
      content: text.replace(/\n/g, '  \n'),
      assistantId: assistant.id,
      topicId: assistant.topics[0].id || uuid(),
      createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      status: 'success'
    }

    EventEmitter.emit(EVENT_NAMES.SEND_MESSAGE, message)

    setText('')
    setTimeout(() => setText(''), 500)

    setExpend(false)
  }, [assistant.id, assistant.topics, generating, text])

  const inputTokenCount = useMemo(() => estimateInputTokenCount(text), [text])

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (expended) {
      if (event.key === 'Escape') {
        return setExpend(false)
      }
    }

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
    const topic = getDefaultTopic()
    addTopic(topic)
    setActiveTopic(topic)
  }, [addTopic, setActiveTopic])

  const clearTopic = async () => {
    if (generating) {
      onPause()
      await delay(1)
    }
    EventEmitter.emit(EVENT_NAMES.CLEAR_MESSAGES)
  }

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
          EventEmitter.emit(EVENT_NAMES.SHOW_TOPIC_SIDEBAR)
          inputRef.current?.focus()
        }
      }
    }
    document.addEventListener('keydown', onKeydown)
    return () => document.removeEventListener('keydown', onKeydown)
  }, [addNewTopic, generating])

  useEffect(() => {
    const _setEstimateTokenCount = debounce(setEstimateTokenCount, 100, { leading: false, trailing: true })
    const unsubscribes = [
      EventEmitter.on(EVENT_NAMES.EDIT_MESSAGE, (message: Message) => {
        setText(message.content)
        inputRef.current?.focus()
      }),
      EventEmitter.on(EVENT_NAMES.ESTIMATED_TOKEN_COUNT, _setEstimateTokenCount)
    ]
    return () => unsubscribes.forEach((unsub) => unsub())
  }, [])

  useEffect(() => {
    inputRef.current?.focus()
  }, [assistant])

  return (
    <Container
      id="inputbar"
      style={{ minHeight: expended ? '60%' : 'var(--input-bar-height)' }}
      className={inputFocus ? 'focus' : ''}>
      <Toolbar>
        <ToolbarMenu>
          <Tooltip placement="top" title={t('chat.input.new_topic')} arrow>
            <ToolbarButton type="text" onClick={addNewTopic}>
              <PlusCircleOutlined />
            </ToolbarButton>
          </Tooltip>
          <Tooltip placement="top" title={t('chat.input.clear')} arrow>
            <Popconfirm
              title={t('chat.input.clear.content')}
              placement="top"
              onConfirm={clearTopic}
              okButtonProps={{ danger: true }}
              icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
              okText={t('chat.input.clear')}>
              <ToolbarButton type="text">
                <ClearOutlined />
              </ToolbarButton>
            </Popconfirm>
          </Tooltip>
          <Tooltip placement="top" title={t('chat.input.topics')} arrow>
            <ToolbarButton type="text" onClick={() => EventEmitter.emit(EVENT_NAMES.SHOW_TOPIC_SIDEBAR)}>
              <HistoryOutlined />
            </ToolbarButton>
          </Tooltip>
          <Tooltip placement="top" title={t('chat.input.settings')} arrow>
            <ToolbarButton type="text" onClick={() => EventEmitter.emit(EVENT_NAMES.SHOW_CHAT_SETTINGS)}>
              <ControlOutlined />
            </ToolbarButton>
          </Tooltip>
          <Tooltip placement="top" title={expended ? t('chat.input.collapse') : t('chat.input.expand')} arrow>
            <ToolbarButton type="text" onClick={() => setExpend(!expended)}>
              {expended ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
            </ToolbarButton>
          </Tooltip>
          {showInputEstimatedTokens && (
            <TextCount>
              <Tooltip title={t('chat.input.context_count.tip') + ' | ' + t('chat.input.estimated_tokens.tip')}>
                <Tag
                  style={{
                    cursor: 'pointer',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '2px 8px',
                    borderWidth: 0.5
                  }}>
                  <i className="iconfont icon-history" style={{ marginRight: '3px' }} />
                  {assistant?.settings?.contextCount ?? DEFAULT_CONEXTCOUNT}
                  <Divider type="vertical" style={{ marginTop: 2, marginLeft: 5, marginRight: 5 }} />↑{inputTokenCount}
                  <span style={{ margin: '0 2px' }}>/</span>
                  {estimateTokenCount}
                </Tag>
              </Tooltip>
            </TextCount>
          )}
        </ToolbarMenu>
        <ToolbarMenu>
          {generating && (
            <Tooltip placement="top" title={t('chat.input.pause')} arrow>
              <ToolbarButton type="text" onClick={onPause} style={{ marginRight: -2, marginTop: 1 }}>
                <PauseCircleOutlined style={{ color: 'var(--color-error)', fontSize: 20 }} />
              </ToolbarButton>
            </Tooltip>
          )}
          {!generating && <SendMessageButton sendMessage={sendMessage} disabled={generating || !text} />}
        </ToolbarMenu>
      </Toolbar>
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={t('chat.input.placeholder')}
        autoFocus
        contextMenu="true"
        variant="borderless"
        ref={inputRef}
        styles={{ textarea: { paddingLeft: 0 } }}
        onFocus={() => setInputFocus(true)}
        onBlur={() => setInputFocus(false)}
        style={{ fontSize }}
      />
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: var(--input-bar-height);
  border: 1px solid var(--color-border-soft);
  transition: all 0.3s ease;
  position: relative;
  margin: 0 20px 15px 20px;
  border-radius: 10px;
  &.focus {
  }
`

const Textarea = styled(TextArea)`
  padding: 0;
  border-radius: 0;
  display: flex;
  flex: 1;
  margin: 0 15px 5px 15px;
  font-family: Ubuntu;
  resize: vertical;
  overflow: auto;
  width: auto;
`

const Toolbar = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 0 8px;
  padding-top: 3px;
  padding-bottom: 0;
`

const ToolbarMenu = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 6px;
`

const ToolbarButton = styled(Button)`
  width: 32px;
  height: 32px;
  font-size: 18px;
  border-radius: 50%;
  transition: all 0.3s ease;
  color: var(--color-icon);
  &.anticon {
    transition: all 0.3s ease;
    color: var(--color-icon);
  }
  &:hover {
    background-color: var(--color-background-soft);
    .anticon {
      color: var(--color-text-1);
    }
  }
`

const TextCount = styled.div`
  font-size: 11px;
  color: var(--color-text-3);
  z-index: 10;
  padding: 2px;
  border-top-left-radius: 7px;
  user-select: none;
`

export default Inputbar
