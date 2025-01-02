import {
  ClearOutlined,
  FormOutlined,
  GlobalOutlined,
  PauseCircleOutlined,
  QuestionCircleOutlined
} from '@ant-design/icons'
import TranslateButton from '@renderer/components/TranslateButton'
import { isVisionModel, isWebSearchModel } from '@renderer/config/models'
import db from '@renderer/databases'
import { useAssistant } from '@renderer/hooks/useAssistant'
import { useRuntime } from '@renderer/hooks/useRuntime'
import { useMessageStyle, useSettings } from '@renderer/hooks/useSettings'
import { useShortcut, useShortcutDisplay } from '@renderer/hooks/useShortcuts'
import { useShowTopics } from '@renderer/hooks/useStore'
import { addAssistantMessagesToTopic, getDefaultTopic } from '@renderer/services/AssistantService'
import { EVENT_NAMES, EventEmitter } from '@renderer/services/EventService'
import FileManager from '@renderer/services/FileManager'
import { estimateTextTokens as estimateTxtTokens } from '@renderer/services/TokenService'
import { translateText } from '@renderer/services/TranslateService'
import store, { useAppDispatch, useAppSelector } from '@renderer/store'
import { setGenerating, setSearching } from '@renderer/store/runtime'
import { Assistant, FileType, KnowledgeBase, Message, Topic } from '@renderer/types'
import { delay, getFileExtension, uuid } from '@renderer/utils'
import { documentExts, imageExts, textExts } from '@shared/config/constant'
import { Button, Popconfirm, Tooltip } from 'antd'
import TextArea, { TextAreaRef } from 'antd/es/input/TextArea'
import dayjs from 'dayjs'
import { debounce, isEmpty } from 'lodash'
import { CSSProperties, FC, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import AttachmentButton from '../../home/Inputbar/AttachmentButton'
import AttachmentPreview from '../../home/Inputbar/AttachmentPreview'
import KnowledgeBaseButton from '../../home/Inputbar/KnowledgeBaseButton'
import SendMessageButton from '../../home/Inputbar/SendMessageButton'

interface Props {
  assistant: Assistant
  setActiveTopic: (topic: Topic) => void
}

let _text = ''
let _files: FileType[] = []
let _base: KnowledgeBase | undefined

const Inputbar: FC<Props> = ({ assistant: _assistant, setActiveTopic }) => {
  const [text, setText] = useState(_text)
  const [inputFocus, setInputFocus] = useState(false)
  const { assistant, addTopic, model, setModel, updateAssistant } = useAssistant(_assistant.id)
  const {
    sendMessageShortcut,
    fontSize,
    pasteLongTextAsFile,
    pasteLongTextThreshold,
    showInputEstimatedTokens,
    clickAssistantToShowTopic,
    language,
    autoTranslateWithSpace
  } = useSettings()
  const [expended, setExpend] = useState(false)
  const [estimateTokenCount, setEstimateTokenCount] = useState(0)
  const [contextCount, setContextCount] = useState(0)
  const generating = useAppSelector((state) => state.runtime.generating)
  const textareaRef = useRef<TextAreaRef>(null)
  const [files, setFiles] = useState<FileType[]>(_files)
  const { t } = useTranslation()
  const containerRef = useRef(null)
  const { showTopics, toggleShowTopics } = useShowTopics()
  const { searching } = useRuntime()
  const { isBubbleStyle } = useMessageStyle()
  const dispatch = useAppDispatch()
  const [spaceClickCount, setSpaceClickCount] = useState(0)
  const spaceClickTimer = useRef<NodeJS.Timeout>()
  const [isTranslating, setIsTranslating] = useState(false)
  const [selectedKnowledgeBase, setSelectedKnowledgeBase] = useState<KnowledgeBase | undefined>(_base)

  const isVision = useMemo(() => isVisionModel(model), [model])
  const supportExts = useMemo(() => [...textExts, ...documentExts, ...(isVision ? imageExts : [])], [isVision])

  const estimateTextTokens = useCallback(debounce(estimateTxtTokens, 1000), [])
  const inputTokenCount = useMemo(
    () => (showInputEstimatedTokens ? estimateTextTokens(text) || 0 : 0),
    [estimateTextTokens, showInputEstimatedTokens, text]
  )
  const newTopicShortcut = useShortcutDisplay('new_topic')
  const inputEmpty = isEmpty(text.trim()) && files.length === 0

  _text = text
  _files = files
  _base = selectedKnowledgeBase

  const sendMessage = useCallback(async () => {
    if (generating) {
      return
    }

    if (inputEmpty) {
      return
    }

    const message: Message = {
      id: uuid(),
      role: 'user',
      content: text,
      assistantId: assistant.id,
      topicId: assistant.topics[0].id || uuid(),
      createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      type: 'text',
      status: 'success'
    }

    if (selectedKnowledgeBase) {
      message.knowledgeBaseIds = [selectedKnowledgeBase.id]
    }

    if (files.length > 0) {
      message.files = await FileManager.uploadFiles(files)
    }

    EventEmitter.emit(EVENT_NAMES.SEND_MESSAGE, message)

    setText('')
    setFiles([])
    setTimeout(() => setText(''), 500)
    setTimeout(() => resizeTextArea(), 0)

    setExpend(false)
  }, [generating, inputEmpty, text, assistant.id, assistant.topics, selectedKnowledgeBase, files])

  const translate = async () => {
    if (isTranslating) {
      return
    }

    try {
      setIsTranslating(true)
      const translatedText = await translateText(text, 'english')
      translatedText && setText(translatedText)
      setTimeout(() => resizeTextArea(), 0)
    } catch (error) {
      console.error('Translation failed:', error)
    } finally {
      setIsTranslating(false)
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const isEnterPressed = event.keyCode == 13

    if (autoTranslateWithSpace) {
      if (event.key === ' ') {
        setSpaceClickCount((prev) => prev + 1)

        if (spaceClickTimer.current) {
          clearTimeout(spaceClickTimer.current)
        }

        spaceClickTimer.current = setTimeout(() => {
          setSpaceClickCount(0)
        }, 200)

        if (spaceClickCount === 2) {
          console.log('Triple space detected - trigger translation')
          setSpaceClickCount(0)
          setIsTranslating(true)
          translate()
          return
        }
      }
    }

    if (expended) {
      if (event.key === 'Escape') {
        return setExpend(false)
      }
    }

    if (sendMessageShortcut === 'Enter' && isEnterPressed) {
      if (event.shiftKey) {
        return
      }
      sendMessage()
      return event.preventDefault()
    }

    if (sendMessageShortcut === 'Shift+Enter' && isEnterPressed && event.shiftKey) {
      sendMessage()
      return event.preventDefault()
    }

    if (sendMessageShortcut === 'Ctrl+Enter' && isEnterPressed && event.ctrlKey) {
      sendMessage()
      return event.preventDefault()
    }

    if (sendMessageShortcut === 'Command+Enter' && isEnterPressed && event.metaKey) {
      sendMessage()
      return event.preventDefault()
    }
  }

  const addNewTopic = useCallback(async () => {
    if (generating) {
      window.message.warning({ content: t('message.switch.disabled'), key: 'generating' })
      return
    }

    const topic = getDefaultTopic(assistant.id)

    await db.topics.add({ id: topic.id, messages: [] })
    await addAssistantMessagesToTopic({ assistant, topic })

    // Reset to assistant default model
    if (assistant.settings?.autoResetModel) {
      assistant.defaultModel && setModel(assistant.defaultModel)
    }

    addTopic(topic)
    setActiveTopic(topic)

    clickAssistantToShowTopic && setTimeout(() => EventEmitter.emit(EVENT_NAMES.SHOW_TOPIC_SIDEBAR), 0)
  }, [addTopic, assistant, clickAssistantToShowTopic, generating, setActiveTopic, setModel, t])

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

  const onNewContext = () => {
    if (generating) return onPause()
    EventEmitter.emit(EVENT_NAMES.NEW_CONTEXT)
  }

  const resizeTextArea = () => {
    const textArea = textareaRef.current?.resizableTextArea?.textArea
    if (textArea) {
      textArea.style.height = 'auto'
      textArea.style.height = textArea?.scrollHeight > 400 ? '400px' : `${textArea?.scrollHeight}px`
    }
  }

  const onToggleExpended = () => {
    const isExpended = !expended
    setExpend(isExpended)
    const textArea = textareaRef.current?.resizableTextArea?.textArea

    if (textArea) {
      if (isExpended) {
        textArea.style.height = '70vh'
      } else {
        resizeTextArea()
      }
    }

    textareaRef.current?.focus()
  }

  const onInput = () => !expended && resizeTextArea()

  const onPaste = useCallback(
    async (event: ClipboardEvent) => {
      for (const file of event.clipboardData?.files || []) {
        event.preventDefault()

        if (file.path === '') {
          if (file.type.startsWith('image/')) {
            const tempFilePath = await window.api.file.create(file.name)
            const arrayBuffer = await file.arrayBuffer()
            const uint8Array = new Uint8Array(arrayBuffer)
            await window.api.file.write(tempFilePath, uint8Array)
            const selectedFile = await window.api.file.get(tempFilePath)
            selectedFile && setFiles((prevFiles) => [...prevFiles, selectedFile])
            break
          }
        }

        if (file.path) {
          if (supportExts.includes(getFileExtension(file.path))) {
            const selectedFile = await window.api.file.get(file.path)
            selectedFile && setFiles((prevFiles) => [...prevFiles, selectedFile])
          }
        }
      }

      if (pasteLongTextAsFile) {
        const item = event.clipboardData?.items[0]
        if (item && item.kind === 'string' && item.type === 'text/plain') {
          item.getAsString(async (pasteText) => {
            if (pasteText.length > pasteLongTextThreshold) {
              const tempFilePath = await window.api.file.create('pasted_text.txt')
              await window.api.file.write(tempFilePath, pasteText)
              const selectedFile = await window.api.file.get(tempFilePath)
              selectedFile && setFiles((prevFiles) => [...prevFiles, selectedFile])
              setText(text)
              setTimeout(() => resizeTextArea(), 0)
            }
          })
        }
      }
    },
    [pasteLongTextAsFile, pasteLongTextThreshold, supportExts, text]
  )

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()

    const files = Array.from(e.dataTransfer.files)

    files.forEach(async (file) => {
      if (supportExts.includes(getFileExtension(file.path))) {
        const selectedFile = await window.api.file.get(file.path)
        selectedFile && setFiles((prevFiles) => [...prevFiles, selectedFile])
      }
    })
  }

  const onTranslated = (translatedText: string) => {
    setText(translatedText)
    setTimeout(() => resizeTextArea(), 0)
  }

  useShortcut('new_topic', () => {
    if (!generating) {
      addNewTopic()
      EventEmitter.emit(EVENT_NAMES.SHOW_TOPIC_SIDEBAR)
      textareaRef.current?.focus()
    }
  })

  useEffect(() => {
    const _setEstimateTokenCount = debounce(setEstimateTokenCount, 100, { leading: false, trailing: true })
    const unsubscribes = [
      EventEmitter.on(EVENT_NAMES.EDIT_MESSAGE, (message: Message) => {
        setText(message.content)
        textareaRef.current?.focus()
        setTimeout(() => resizeTextArea(), 0)
      }),
      EventEmitter.on(EVENT_NAMES.ESTIMATED_TOKEN_COUNT, ({ tokensCount, contextCount }) => {
        _setEstimateTokenCount(tokensCount)
        setContextCount(contextCount)
      }),
      EventEmitter.on(EVENT_NAMES.ADD_NEW_TOPIC, addNewTopic)
    ]
    return () => unsubscribes.forEach((unsub) => unsub())
  }, [addNewTopic])

  useEffect(() => {
    textareaRef.current?.focus()
  }, [assistant])

  useEffect(() => {
    setTimeout(() => resizeTextArea(), 0)
  }, [])

  useEffect(() => {
    return () => {
      if (spaceClickTimer.current) {
        clearTimeout(spaceClickTimer.current)
      }
    }
  }, [])

  const handleKnowledgeBaseSelect = (base?: KnowledgeBase) => {
    setSelectedKnowledgeBase(base)
  }

  return (
    <Container onDragOver={handleDragOver} onDrop={handleDrop}>
      <AttachmentPreview files={files} setFiles={setFiles} />
      <InputBarContainer id="inputbar" className={inputFocus ? 'focus' : ''} ref={containerRef}>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isTranslating ? t('chat.input.translating') : t('chat.input.placeholder')}
          autoFocus
          contextMenu="true"
          variant="borderless"
          rows={1}
          ref={textareaRef}
          style={{ fontSize }}
          styles={{ textarea: TextareaStyle }}
          onFocus={() => setInputFocus(true)}
          onBlur={() => setInputFocus(false)}
          onInput={onInput}
          disabled={searching}
          onPaste={(e) => onPaste(e.nativeEvent)}
          onClick={() => searching && dispatch(setSearching(false))}
        />
        <Toolbar>
          <ToolbarMenu>
            <Tooltip placement="top" title={t('chat.input.new_topic', { Command: newTopicShortcut })} arrow>
              <ToolbarButton type="text" onClick={addNewTopic}>
                <FormOutlined />
              </ToolbarButton>
            </Tooltip>
            {isWebSearchModel(model) && (
              <Tooltip placement="top" title={t('chat.input.web_search')} arrow>
                <ToolbarButton
                  type="text"
                  onClick={() => updateAssistant({ ...assistant, enableWebSearch: !assistant.enableWebSearch })}>
                  <GlobalOutlined
                    style={{ color: assistant.enableWebSearch ? 'var(--color-link)' : 'var(--color-icon)' }}
                  />
                </ToolbarButton>
              </Tooltip>
            )}
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
            <KnowledgeBaseButton
              selectedBase={selectedKnowledgeBase}
              onSelect={handleKnowledgeBaseSelect}
              ToolbarButton={ToolbarButton}
              disabled={files.length > 0}
            />
            <AttachmentButton
              model={model}
              files={files}
              setFiles={setFiles}
              ToolbarButton={ToolbarButton}
              disabled={!!selectedKnowledgeBase}
            />
          </ToolbarMenu>
          <ToolbarMenu>
            {!language.startsWith('en') && (
              <TranslateButton text={text} onTranslated={onTranslated} isLoading={isTranslating} />
            )}
            {generating && (
              <Tooltip placement="top" title={t('chat.input.pause')} arrow>
                <ToolbarButton type="text" onClick={onPause} style={{ marginRight: -2, marginTop: 1 }}>
                  <PauseCircleOutlined style={{ color: 'var(--color-error)', fontSize: 20 }} />
                </ToolbarButton>
              </Tooltip>
            )}
            {!generating && <SendMessageButton sendMessage={sendMessage} disabled={generating || inputEmpty} />}
          </ToolbarMenu>
        </Toolbar>
      </InputBarContainer>
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  -webkit-app-region: none;
`

const InputBarContainer = styled.div`
  border: 1px solid var(--color-border);
  transition: all 0.3s ease;
  position: relative;
  margin: 10px;
  border-radius: 10px;
`

const TextareaStyle: CSSProperties = {
  paddingLeft: 0,
  padding: '10px 15px 8px'
}

const Textarea = styled(TextArea)`
  padding: 0;
  border-radius: 0;
  display: flex;
  flex: 1;
  font-family: Ubuntu;
  resize: none !important;
  overflow: auto;
  width: 100%;
  box-sizing: border-box;
  &.ant-input {
    line-height: 1.4;
  }
`

const Toolbar = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 0 8px;
  padding-bottom: 0;
  margin-bottom: 4px;
  height: 36px;
`

const ToolbarMenu = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 6px;
`

const ToolbarButton = styled(Button)`
  width: 30px;
  height: 30px;
  font-size: 17px;
  border-radius: 50%;
  transition: all 0.3s ease;
  color: var(--color-icon);
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 0;
  &.anticon,
  &.iconfont {
    transition: all 0.3s ease;
    color: var(--color-icon);
  }
  .icon-a-addchat {
    font-size: 19px;
    margin-bottom: -2px;
  }
  &:hover {
    background-color: var(--color-background-soft);
    .anticon,
    .iconfont {
      color: var(--color-text-1);
    }
  }
  &.active {
    background-color: var(--color-primary) !important;
    .anticon,
    .iconfont {
      color: var(--color-white-soft);
    }
    &:hover {
      background-color: var(--color-primary);
    }
  }
`

export default Inputbar