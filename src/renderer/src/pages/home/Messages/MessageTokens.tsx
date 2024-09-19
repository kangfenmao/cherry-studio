import { useRuntime } from '@renderer/hooks/useStore'
import { Message } from '@renderer/types'
import styled from 'styled-components'

const MessgeTokens: React.FC<{ message: Message }> = ({ message }) => {
  const { generating } = useRuntime()

  if (!message.usage) {
    return null
  }

  if (message.role === 'user') {
    return <MessageMetadata>Tokens: {message?.usage?.total_tokens}</MessageMetadata>
  }

  if (generating) {
    return null
  }

  if (message.role === 'assistant') {
    return (
      <MessageMetadata>
        Tokens: {message?.usage?.total_tokens} | ↑{message?.usage?.prompt_tokens} | ↓{message?.usage?.completion_tokens}
      </MessageMetadata>
    )
  }

  return null
}

const MessageMetadata = styled.div`
  font-size: 12px;
  color: var(--color-text-2);
  user-select: text;
  margin: 2px 0;
`

export default MessgeTokens
