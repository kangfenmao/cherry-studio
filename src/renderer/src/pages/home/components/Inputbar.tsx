import { Message, Thread } from '@renderer/types'
import { FC, useState } from 'react'
import styled from 'styled-components'

interface Props {
  activeThread: Thread
  onSendMessage: (message: Message) => void
}

const Inputbar: FC<Props> = ({ activeThread, onSendMessage }) => {
  const [text, setText] = useState('')

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      const message: Message = {
        id: Math.random().toString(),
        content: text,
        threadId: activeThread.id,
        createdAt: 'now'
      }
      onSendMessage(message)
      setText('')
    }
  }

  return (
    <Textarea
      value={text}
      onChange={(e) => setText(e.target.value)}
      onKeyDown={handleKeyDown}
      placeholder="Type a message..."
      autoFocus
    />
  )
}

const Textarea = styled.textarea`
  padding: 15px;
  width: 100%;
  height: 100px;
  border: none;
  outline: none;
  resize: none;
  font-size: 14px;
  color: var(--color-text);
  background-color: transparent;
  border-top: 1px solid #ffffff20;
`

export default Inputbar
