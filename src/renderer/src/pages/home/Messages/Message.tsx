import {
  CheckOutlined,
  DeleteOutlined,
  EditOutlined,
  MenuOutlined,
  QuestionCircleOutlined,
  SaveOutlined,
  SyncOutlined
} from '@ant-design/icons'
import UserPopup from '@renderer/components/Popups/UserPopup'
import { FONT_FAMILY } from '@renderer/config/constant'
import { startMinAppById } from '@renderer/config/minapp'
import { getModelLogo } from '@renderer/config/provider'
import { useAssistant } from '@renderer/hooks/useAssistant'
import useAvatar from '@renderer/hooks/useAvatar'
import { useModel } from '@renderer/hooks/useModel'
import { useSettings } from '@renderer/hooks/useSettings'
import { useRuntime } from '@renderer/hooks/useStore'
import { EVENT_NAMES, EventEmitter } from '@renderer/services/event'
import { Message, Model } from '@renderer/types'
import { firstLetter, removeLeadingEmoji } from '@renderer/utils'
import { Alert, Avatar, Dropdown, Popconfirm, Tooltip } from 'antd'
import dayjs from 'dayjs'
import { upperFirst } from 'lodash'
import { FC, memo, useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import SelectModelDropdown from '../components/SelectModelDropdown'
import Markdown from '../Markdown/Markdown'
import MessageAttachments from './MessageAttachments'

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
  const { assistant, setModel } = useAssistant(message.assistantId)
  const model = useModel(message.modelId)
  const { userName, showMessageDivider, messageFont, fontSize } = useSettings()
  const { generating } = useRuntime()
  const [copied, setCopied] = useState(false)

  const isLastMessage = index === 0
  const isUserMessage = message.role === 'user'
  const isAssistantMessage = message.role === 'assistant'
  const canRegenerate = isLastMessage && isAssistantMessage
  const showMetadata = Boolean(message.usage) && !generating

  const onCopy = useCallback(() => {
    navigator.clipboard.writeText(message.content)
    window.message.success({ content: t('message.copied'), key: 'copy-message' })
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [message.content, t])

  const onEdit = useCallback(() => EventEmitter.emit(EVENT_NAMES.EDIT_MESSAGE, message), [message])

  const onRegenerate = useCallback(
    (model: Model) => {
      setModel(model)
      setTimeout(() => EventEmitter.emit(EVENT_NAMES.REGENERATE_MESSAGE, model), 100)
    },
    [setModel]
  )

  const getUserName = useCallback(() => {
    if (message.id === 'assistant') return assistant?.name
    if (message.role === 'assistant') return upperFirst(model?.name || model?.id)
    return userName || t('common.you')
  }, [assistant?.name, message.id, message.role, model?.id, model?.name, t, userName])

  const fontFamily = useMemo(() => {
    return messageFont === 'serif' ? FONT_FAMILY.replace('sans-serif', 'serif').replace('Ubuntu, ', '') : FONT_FAMILY
  }, [messageFont])

  const messageBorder = showMessageDivider ? undefined : 'none'
  const avatarSource = useMemo(() => (message.modelId ? getModelLogo(message.modelId) : undefined), [message.modelId])
  const avatarName = useMemo(() => firstLetter(assistant?.name).toUpperCase(), [assistant?.name])
  const username = useMemo(() => removeLeadingEmoji(getUserName()), [getUserName])

  const dropdownItems = useMemo(
    () => [
      {
        label: t('chat.save'),
        key: 'save',
        icon: <SaveOutlined />,
        onClick: () => {
          const fileName = message.createdAt + '.md'
          window.api.saveFile(fileName, message.content)
        }
      }
    ],
    [t, message]
  )

  const MessageItem = useCallback(() => {
    if (message.status === 'sending') {
      return (
        <MessageContentLoading>
          <SyncOutlined spin size={24} />
        </MessageContentLoading>
      )
    }

    if (message.status === 'error') {
      return (
        <Alert
          message={<div style={{ fontSize: 14 }}>{t('error.chat.response')}</div>}
          description={<Markdown message={message} />}
          type="error"
          style={{ marginBottom: 15, padding: 10, fontSize: 12 }}
        />
      )
    }

    return (
      <>
        <Markdown message={message} />
        <MessageAttachments message={message} />
      </>
    )
  }, [message, t])

  const showMiniApp = () => model?.provider && startMinAppById(model?.provider)

  return (
    <MessageContainer key={message.id} className="message">
      <MessageHeader>
        <AvatarWrapper>
          {isAssistantMessage ? (
            <Avatar
              src={avatarSource}
              size={35}
              style={{ borderRadius: '20%', cursor: 'pointer' }}
              onClick={showMiniApp}>
              {avatarName}
            </Avatar>
          ) : (
            <Avatar
              src={avatar}
              size={35}
              style={{ borderRadius: '20%', cursor: 'pointer' }}
              onClick={() => UserPopup.show()}
            />
          )}
          <UserWrap>
            <UserName>{username}</UserName>
            <MessageTime>{dayjs(message.createdAt).format('MM/DD HH:mm')}</MessageTime>
          </UserWrap>
        </AvatarWrapper>
      </MessageHeader>
      <MessageContent style={{ fontFamily, fontSize }}>
        <MessageItem />
        <MessageFooter style={{ border: messageBorder }}>
          {showMenu && (
            <MenusBar className={`menubar ${isLastMessage && 'show'} ${(!isLastMessage || isUserMessage) && 'user'}`}>
              {message.role === 'user' && (
                <Tooltip title="Edit" mouseEnterDelay={0.8}>
                  <ActionButton onClick={onEdit}>
                    <EditOutlined />
                  </ActionButton>
                </Tooltip>
              )}
              <Tooltip title={t('common.copy')} mouseEnterDelay={0.8}>
                <ActionButton onClick={onCopy}>
                  {!copied && <i className="iconfont icon-copy"></i>}
                  {copied && <CheckOutlined style={{ color: 'var(--color-primary)' }} />}
                </ActionButton>
              </Tooltip>
              {canRegenerate && (
                <SelectModelDropdown model={model} onSelect={onRegenerate} placement="topLeft">
                  <Tooltip title={t('common.regenerate')} mouseEnterDelay={0.8}>
                    <ActionButton>
                      <SyncOutlined />
                    </ActionButton>
                  </Tooltip>
                </SelectModelDropdown>
              )}
              <Popconfirm
                title={t('message.message.delete.content')}
                okButtonProps={{ danger: true }}
                icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
                onConfirm={() => onDeleteMessage?.(message)}>
                <Tooltip title={t('common.delete')} mouseEnterDelay={1}>
                  <ActionButton>
                    <DeleteOutlined />
                  </ActionButton>
                </Tooltip>
              </Popconfirm>
              {!isUserMessage && (
                <Dropdown menu={{ items: dropdownItems }} trigger={['click']} placement="topRight" arrow>
                  <ActionButton>
                    <MenuOutlined />
                  </ActionButton>
                </Dropdown>
              )}
            </MenusBar>
          )}
          {showMetadata && (
            <MessageMetadata>
              Tokens: {message?.usage?.total_tokens} | ↑{message?.usage?.prompt_tokens} | ↓
              {message?.usage?.completion_tokens}
            </MessageMetadata>
          )}
        </MessageFooter>
      </MessageContent>
    </MessageContainer>
  )
}

const MessageContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 20px;
  position: relative;
  .menubar {
    opacity: 0;
    transition: opacity 0.2s ease;
    &.show {
      opacity: 1;
    }
    &.user {
      position: absolute;
      top: 10px;
      right: 15px;
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

const MessageFooter = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 2px 0;
  margin: 2px 0 8px 0;
  border-top: 0.5px dashed var(--color-border);
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
  margin-left: -5px;
`

const MessageMetadata = styled.div`
  font-size: 12px;
  color: var(--color-text-2);
  user-select: text;
  margin: 2px 0;
`

const ActionButton = styled.div`
  cursor: pointer;
  border-radius: 8px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: 30px;
  height: 30px;
  transition: all 0.3s ease;
  &:hover {
    background-color: var(--color-background-mute);
    .anticon {
      color: var(--color-text-1);
    }
  }
  .anticon,
  .iconfont {
    cursor: pointer;
    font-size: 14px;
    color: var(--color-icon);
  }
  &:hover {
    color: var(--color-text-1);
  }
`

export default memo(MessageItem)
