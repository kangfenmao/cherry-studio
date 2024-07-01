import { Message } from '@renderer/types'
import { Avatar } from 'antd'
import { marked } from 'marked'
import { FC } from 'react'
import styled from 'styled-components'
import Logo from '@renderer/assets/images/logo.png'

const MessageItem: FC<{ message: Message }> = ({ message }) => {
  return (
    <MessageContainer key={message.id}>
      <AvatarWrapper>
        {message.role === 'agent' ? <Avatar src={Logo} /> : <Avatar alt="Alice Swift">Y</Avatar>}
      </AvatarWrapper>
      <div className="markdown" dangerouslySetInnerHTML={{ __html: marked(message.content) }}></div>
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

export default MessageItem
