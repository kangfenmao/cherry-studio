import { SyncOutlined } from '@ant-design/icons'
import { Message, Model } from '@renderer/types'
import { getBriefInfo } from '@renderer/utils'
import React from 'react'
import styled from 'styled-components'

import Markdown from '../Markdown/Markdown'
import MessageAttachments from './MessageAttachments'
import MessageError from './MessageError'

const MessageContent: React.FC<{
  message: Message
  model?: Model
}> = ({ message, model }) => {
  if (message.status === 'sending') {
    return (
      <MessageContentLoading>
        <SyncOutlined spin size={24} />
      </MessageContentLoading>
    )
  }

  if (message.status === 'error') {
    return <MessageError message={message} />
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
