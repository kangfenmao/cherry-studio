import { FC, useState } from 'react'
import styled from 'styled-components'

const Inputbar: FC = () => {
  const [text, setText] = useState('')

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      // 当用户按下Enter键时执行的操作
      console.log('Enter key was pressed')
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
