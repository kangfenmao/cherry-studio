import { Message } from '@renderer/types'
import { Avatar } from 'antd'
import { FC } from 'react'
import styled from 'styled-components'
import Logo from '@renderer/assets/images/logo.png'
import useAvatar from '@renderer/hooks/useAvatar'
import { CopyOutlined, DeleteOutlined } from '@ant-design/icons'
import Markdown from 'react-markdown'
import CodeBlock from './CodeBlock'

interface Props {
  message: Message
  showMenu?: boolean
  onDeleteMessage?: (message: Message) => void
}

const MessageItem: FC<Props> = ({ message, showMenu, onDeleteMessage }) => {
  const avatar = useAvatar()

  const onCopy = () => {
    navigator.clipboard.writeText(message.content)
    window.message.success({ content: 'Copied!', key: 'copy-message' })
  }

  const onDelete = async () => {
    const confirmed = await window.modal.confirm({
      icon: null,
      title: 'Delete Message',
      content: 'Are you sure you want to delete this message?',
      okText: 'Delete',
      okType: 'danger'
    })
    confirmed && onDeleteMessage?.(message)
  }

  return (
    <MessageContainer key={message.id}>
      <AvatarWrapper>{message.role === 'assistant' ? <Avatar src={Logo} /> : <Avatar src={avatar} />}</AvatarWrapper>
      <MessageContent>
        <Markdown className="markdown" components={{ code: CodeBlock as any }}>
          {message.content}
        </Markdown>
        {/* <Markdown className="markdown" dangerouslySetInnerHTML={{ __html: marked(message.content) }} /> */}
        {showMenu && (
          <MenusBar className="menubar">
            <CopyOutlined onClick={onCopy} />
            <DeleteOutlined onClick={onDelete} />
            <ModelName>{message.modelId}</ModelName>
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

// const Markdown = styled.div``

const MessageContent = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  .menubar {
    opacity: 0;
  }
  &:hover {
    .menubar {
      opacity: 1;
    }
  }
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

const ModelName = styled.div`
  font-size: 12px;
  color: var(--color-text-2);
`

export default MessageItem
