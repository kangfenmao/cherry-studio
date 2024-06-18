import { EVENT_NAMES, EventEmitter } from '@renderer/services/event'
import { Message, Thread } from '@renderer/types'
import { uuid } from '@renderer/utils'
import { FC, useState } from 'react'
import styled from 'styled-components'

interface Props {
  thread: Thread
}

const Inputbar: FC<Props> = ({ thread }) => {
  const [text, setText] = useState('')

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter') {
      const conversationId = thread.conversations[0] ? thread.conversations[0] : uuid()

      const message: Message = {
        id: uuid(),
        content: text,
        threadId: thread.id,
        conversationId,
        createdAt: 'now'
      }

      EventEmitter.emit(EVENT_NAMES.SEND_MESSAGE, message)

      setText('')
      event.preventDefault()
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
