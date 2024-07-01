import { EVENT_NAMES, EventEmitter } from '@renderer/services/event'
import { Agent, Message } from '@renderer/types'
import { uuid } from '@renderer/utils'
import { FC, useState } from 'react'
import styled from 'styled-components'
import { MoreOutlined } from '@ant-design/icons'
import { Tooltip } from 'antd'
import { useShowRightSidebar } from '@renderer/hooks/useStore'

interface Props {
  agent: Agent
}

const Inputbar: FC<Props> = ({ agent }) => {
  const [text, setText] = useState('')
  const { setShowRightSidebar } = useShowRightSidebar()

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter') {
      const conversationId = agent.conversations[0] ? agent.conversations[0] : uuid()

      const message: Message = {
        id: uuid(),
        role: 'user',
        content: text,
        agentId: agent.id,
        conversationId,
        createdAt: 'now'
      }

      EventEmitter.emit(EVENT_NAMES.SEND_MESSAGE, message)

      setText('')
      event.preventDefault()
    }
  }

  return (
    <Container>
      <Toolbar>
        <ToolbarMenu>
          <Tooltip placement="top" title=" New Chat " arrow>
            <ToolbarItem>
              <i className="iconfont icon-a-new-chat"></i>
            </ToolbarItem>
          </Tooltip>
          <Tooltip placement="top" title=" Topics " arrow>
            <ToolbarItem onClick={setShowRightSidebar}>
              <i className="iconfont icon-textedit_text_topic"></i>
            </ToolbarItem>
          </Tooltip>
        </ToolbarMenu>
        <ToolbarMenu>
          <Tooltip placement="top" title=" Settings " arrow>
            <ToolbarItem style={{ marginRight: 0 }}>
              <MoreOutlined />
            </ToolbarItem>
          </Tooltip>
        </ToolbarMenu>
      </Toolbar>
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message..."
        autoFocus
        contextMenu="true"
      />
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: var(--input-bar-height);
  border-top: 0.5px solid #ffffff20;
  padding: 5px 15px;
`

const Textarea = styled.textarea`
  display: flex;
  flex: 1;
  border: none;
  outline: none;
  resize: none;
  font-size: 14px;
  color: var(--color-text);
  background-color: transparent;
`

const Toolbar = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 5px;
  margin: 0 -5px;
`

const ToolbarMenu = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`

const ToolbarItem = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  width: 32px;
  height: 32px;
  font-size: 18px;
  border-radius: 50%;
  transition: all 0.2s ease-in-out;
  margin-right: 6px;
  color: var(--color-icon);
  .iconfont {
    font-size: 18px;
    transition: all 0.2s ease-in-out;
  }
  .icon-textedit_text_topic {
    font-size: 20px;
  }
  &:hover {
    background-color: var(--color-background-soft);
    .iconfont {
      color: white;
    }
  }
`

export default Inputbar
