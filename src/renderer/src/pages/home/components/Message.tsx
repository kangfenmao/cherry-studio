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
import { isEmpty } from 'lodash'

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

  return (
    <MessageContainer key={message.id}>
      <AvatarWrapper>
        {message.role === 'assistant' ? (
          <Avatar src={message.modelId ? getModelLogo(message.modelId) : Logo}>
            {firstLetter(message.modelId).toUpperCase()}
          </Avatar>
        ) : (
          <Avatar src={avatar} />
        )}
      </AvatarWrapper>
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
          <MenusBar className={`menubar ${isLastMessage && 'show'}`}>
            {message.role === 'user' && (
              <Tooltip title="Edit" mouseEnterDelay={0.8}>
                <EditOutlined onClick={onEdit} />
              </Tooltip>
            )}
            <Tooltip title={t('common.copy')} mouseEnterDelay={0.8}>
              <CopyOutlined onClick={onCopy} />
            </Tooltip>
            <Tooltip title={t('common.delete')} mouseEnterDelay={0.8}>
              <DeleteOutlined onClick={onDelete} />
            </Tooltip>
            {canRegenerate && (
              <Tooltip title={t('common.regenerate')} mouseEnterDelay={0.8}>
                <SyncOutlined onClick={onRegenerate} />
              </Tooltip>
            )}
            <MessageMetadata>{message.modelId}</MessageMetadata>
            {message.usage && (
              <>
                <MessageMetadata style={{ textTransform: 'uppercase' }}>
                  tokens used: {message.usage.total_tokens} (IN:{message.usage.prompt_tokens}/OUT:
                  {message.usage.completion_tokens})
                </MessageMetadata>
              </>
            )}
          </MenusBar>
        )}
      </MessageContent>
    </MessageContainer>
  )
}

const MessageContainer = styled.div`
  display: flex;
  flex-direction: row;
  padding: 10px 15px;
  position: relative;
`

const AvatarWrapper = styled.div`
  margin-right: 10px;
`

const MessageContent = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: space-between;
  .menubar {
    opacity: 0;
    transition: opacity 0.2s ease;
    &.show {
      opacity: 1;
    }
  }
  &:hover {
    .menubar {
      opacity: 1;
    }
  }
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
  justify-content: flex-start;
  gap: 6px;
  .anticon {
    cursor: pointer;
    margin-right: 8px;
    font-size: 15px;
    color: var(--color-icon);
    &:hover {
      color: var(--color-text-1);
    }
  }
`

const MessageMetadata = styled.div`
  font-size: 12px;
  color: var(--color-text-2);
  user-select: text;
`

export default MessageItem
