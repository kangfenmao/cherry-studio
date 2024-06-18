import { Navbar, NavbarCenter, NavbarLeft, NavbarRight } from '@renderer/components/app/Navbar'
import useThreads from '@renderer/hooks/useThreads'
import { FC, useEffect } from 'react'
import styled from 'styled-components'
import Chat from './components/Chat'
import Threads from './components/Threads'
import { uuid } from '@renderer/utils'

const HomePage: FC = () => {
  const { threads, thread, setThread, addThread } = useThreads()

  useEffect(() => {
    !thread && threads[0] && setThread(threads[0])
  }, [thread, threads])

  const onCreateConversation = () => {
    const _thread = {
      id: uuid(),
      name: 'New conversation',
      avatar: 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y',
      lastMessage: 'message',
      lastMessageAt: 'now',
      conversations: []
    }
    addThread(_thread)
    setThread(_thread)
  }

  return (
    <Container>
      <Navbar>
        <NavbarLeft style={{ justifyContent: 'flex-end' }}>
          <NewButton onClick={onCreateConversation}>
            <i className="iconfont icon-a-addchat"></i>
          </NewButton>
        </NavbarLeft>
        <NavbarCenter style={{ border: 'none' }}>{thread?.name}</NavbarCenter>
        <NavbarRight style={{ justifyContent: 'flex-end', padding: 5 }}>
          <NewButton>
            <i className="iconfont icon-showsidebarhoriz"></i>
          </NewButton>
        </NavbarRight>
      </Navbar>
      <ContentContainer>
        <Threads />
        {thread && <Chat thread={thread} />}
      </ContentContainer>
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  height: 100%;
`

const ContentContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: row;
  height: 100%;
`

const NewButton = styled.div`
  -webkit-app-region: none;
  border-radius: 4px;
  width: 34px;
  height: 34px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  transition: all 0.2s ease-in-out;
  color: var(--color-icon);
  .iconfont {
    font-size: 22px;
  }
  .icon-showsidebarhoriz {
    font-size: 18px;
  }
  &:hover {
    background-color: var(--color-background-soft);
    cursor: pointer;
    color: var(--color-icon-white);
  }
`

export default HomePage
