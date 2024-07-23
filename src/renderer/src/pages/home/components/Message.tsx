import { Message } from '@renderer/types'
import { Avatar, Tooltip } from 'antd'
import { FC } from 'react'
import styled from 'styled-components'
import useAvatar from '@renderer/hooks/useAvatar'
import { CopyOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons'
import Markdown from 'react-markdown'
import CodeBlock from './CodeBlock'
import { EVENT_NAMES, EventEmitter } from '@renderer/services/event'
import { getModelLogo } from '@renderer/config/provider'
import Logo from '@renderer/assets/images/logo.png'
import { SyncOutlined } from '@ant-design/icons'
import { firstLetter } from '@renderer/utils'
import { useTranslation } from 'react-i18next'
import { isEmpty, upperFirst } from 'lodash'
import dayjs from 'dayjs'
import { useAssistant } from '@renderer/hooks/useAssistant'
import { useSettings } from '@renderer/hooks/useSettings'

interface Props {
  message: Message
  index?: number
  total?: number
  showMenu?: boolean
  onDeleteMessage?: (message: Message) => void
}

const MessageItem: FC<Props> = ({ message, index, showMenu, onDeleteMessage }) => {
  const avatar = useAvatar()
  const { t } = useTranslation()
  const { assistant } = useAssistant(message.assistantId)
  const { userName, showMessageDivider } = useSettings()

  const isLastMessage = index === 0
  const canRegenerate = isLastMessage && message.role === 'assistant'

  const onCopy = () => {
    navigator.clipboard.writeText(message.content)
    window.message.success({ content: t('message.copied'), key: 'copy-message' })
  }

  const onDelete = async () => {
    const confirmed = await window.modal.confirm({
      icon: null,
      title: t('message.message.delete.title'),
      content: t('message.message.delete.content'),
      okText: t('common.delete'),
      okType: 'danger'
    })
    confirmed && onDeleteMessage?.(message)
  }

  const onEdit = () => {
    EventEmitter.emit(EVENT_NAMES.EDIT_MESSAGE, message)
  }

  const onRegenerate = () => {
    onDeleteMessage?.(message)
    setTimeout(() => EventEmitter.emit(EVENT_NAMES.REGENERATE_MESSAGE), 100)
  }

  const getMessageContent = (message: Message) => {
    if (isEmpty(message.content) && message.status === 'paused') {
      return t('message.chat.completion.paused')
    }
    return message.content
  }

  const getUserName = () => {
    if (message.id === 'assistant') {
      return assistant.name
    }

    if (message.role === 'assistant') {
      return upperFirst(message.modelId)
    }

    return userName || t('common.you')
  }

  return (
    <MessageContainer key={message.id} className="message" style={{ border: showMessageDivider ? undefined : 'none' }}>
      <MessageHeader>
        <AvatarWrapper>
          {message.role === 'assistant' ? (
            <Avatar src={message.modelId ? getModelLogo(message.modelId) : Logo} size={35}>
              {firstLetter(message.modelId).toUpperCase()}
            </Avatar>
          ) : (
            <Avatar src={avatar} size={35} />
          )}
          <UserWrap>
            <UserName>{getUserName()}</UserName>
            <MessageTime>{dayjs(message.createdAt).format('MM/DD HH:mm')}</MessageTime>
          </UserWrap>
        </AvatarWrapper>
        {message.usage && (
          <MessageMetadata>
            Tokens: {message.usage.total_tokens} | ↑{message.usage.prompt_tokens}↓{message.usage.completion_tokens}
          </MessageMetadata>
        )}
      </MessageHeader>
      <MessageContent>
        {message.status === 'sending' && (
          <MessageContentLoading>
            <SyncOutlined spin size={24} />
          </MessageContentLoading>
        )}
        {message.status !== 'sending' && (
          <Markdown className="markdown" components={{ code: CodeBlock as any }}>
            {getMessageContent(message)}
          </Markdown>
        )}
        {showMenu && (
          <MenusBar className={`menubar ${isLastMessage && 'show'} ${message.content.length < 300 && 'user'}`}>
            {message.role === 'user' && (
              <Tooltip title="Edit" mouseEnterDelay={0.8}>
                <ActionButton>
                  <EditOutlined onClick={onEdit} />
                </ActionButton>
              </Tooltip>
            )}
            <Tooltip title={t('common.copy')} mouseEnterDelay={0.8}>
              <ActionButton>
                <CopyOutlined onClick={onCopy} />
              </ActionButton>
            </Tooltip>
            <Tooltip title={t('common.delete')} mouseEnterDelay={0.8}>
              <ActionButton>
                <DeleteOutlined onClick={onDelete} />
              </ActionButton>
            </Tooltip>
            {canRegenerate && (
              <Tooltip title={t('common.regenerate')} mouseEnterDelay={0.8}>
                <ActionButton>
                  <SyncOutlined onClick={onRegenerate} />
                </ActionButton>
              </Tooltip>
            )}
          </MenusBar>
        )}
      </MessageContent>
    </MessageContainer>
  )
}

const MessageContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 10px;
  position: relative;
  border-bottom: 0.5px dotted var(--color-border);
  .menubar {
    opacity: 0;
    transition: opacity 0.2s ease;
    &.show {
      opacity: 1;
    }
    &.user {
      position: absolute;
      top: 15px;
      right: 10px;
    }
  }
  &:hover {
    .menubar {
      opacity: 1;
    }
  }
`

const MessageHeader = styled.div`
  margin-right: 10px;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding-bottom: 4px;
  justify-content: space-between;
`

const AvatarWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`

const UserWrap = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin-left: 12px;
`

const UserName = styled.div`
  font-size: 14px;
  font-weight: 600;
`

const MessageTime = styled.div`
  font-size: 12px;
  color: var(--color-text-3);
`

const MessageContent = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: space-between;
  margin-left: 46px;
  margin-top: 5px;
`

const MessageContentLoading = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 32px;
`

const MenusBar = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  gap: 6px;
`

const MessageMetadata = styled.div`
  font-size: 12px;
  color: var(--color-text-2);
  user-select: text;
`

const ActionButton = styled.div`
  cursor: pointer;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: 30px;
  height: 30px;
  .anticon {
    cursor: pointer;
    font-size: 14px;
    color: var(--color-icon);
  }
  &:hover {
    color: var(--color-text-1);
  }
`

export default MessageItem
