import { SyncOutlined } from '@ant-design/icons'
import { Message, Model } from '@renderer/types'
import { getBriefInfo } from '@renderer/utils'
import { Alert } from 'antd'
import React from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import Markdown from '../Markdown/Markdown'
import MessageAttachments from './MessageAttachments'

const MessageContent: React.FC<{
  message: Message
  model?: Model
}> = ({ message, model }) => {
  const { t } = useTranslation()

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

  if (message.type === '@' && model) {
    const content = `[@${model.name}](#)  ${getBriefInfo(message.content)}`
    return <Markdown message={{ ...message, content }} />
  }

  return (
    <>
      <Markdown message={message} />
      <MessageAttachments message={message} />
    </>
  )
}

const MessageContentLoading = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 32px;
`

export default React.memo(MessageContent)
