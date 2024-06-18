import type { Thread } from '@renderer/types'
import { FC } from 'react'
import styled from 'styled-components'

interface Props {
  threads: Thread[]
  activeThread?: Thread
  onSelectThread: (conversation: Thread) => void
}

const Threads: FC<Props> = ({ threads, activeThread, onSelectThread }) => {
  return (
    <Container>
      {threads.map((thread) => (
        <ThreadItem
          key={thread.id}
          onClick={() => onSelectThread(thread)}
          className={thread.id === activeThread?.id ? 'active' : ''}>
          <ThreadTime>{thread.lastMessageAt}</ThreadTime>
          <ThreadName>{thread.name}</ThreadName>
          <ThreadLastMessage>{thread.lastMessage}</ThreadLastMessage>
        </ThreadItem>
      ))}
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-width: var(--conversations-width);
  border-right: 1px solid #ffffff20;
  height: calc(100vh - var(--navbar-height));
  padding: 10px;
  overflow-y: scroll;
  &::-webkit-scrollbar {
    display: none;
  }
`

const ThreadItem = styled.div`
  display: flex;
  flex-direction: column;
  padding: 10px;
  cursor: pointer;
  &:hover {
    background-color: var(--color-background-soft);
  }
  &.active {
    background-color: var(--color-background-mute);
    cursor: pointer;
  }
  border-radius: 8px;
  margin-bottom: 10px;
`

const ThreadTime = styled.div`
  font-size: 12px;
  color: var(--color-text-2);
`

const ThreadName = styled.div`
  font-size: 14px;
  color: var(--color-text-1);
  font-weight: bold;
`

const ThreadLastMessage = styled.div`
  font-size: 12px;
  color: var(--color-text-2);
`

export default Threads
