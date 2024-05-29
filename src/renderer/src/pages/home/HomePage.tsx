import { Navbar, NavbarCenter, NavbarLeft, NavbarRight } from '@renderer/components/app/Navbar'
import { FC } from 'react'
import styled from 'styled-components'

const HomePage: FC = () => {
  const onCreateConversation = () => {
    window.electron.ipcRenderer.send('storage.set', { key: 'conversations', value: [] })
  }

  return (
    <MainContainer>
      <Navbar>
        <NavbarLeft style={{ justifyContent: 'space-between' }}>
          <NewButton onClick={onCreateConversation}>new</NewButton>
          <NewButton onClick={onCreateConversation}>new</NewButton>
        </NavbarLeft>
        <NavbarCenter>Cherry AI</NavbarCenter>
        <NavbarRight />
      </Navbar>
      <ContentContainer>
        <Conversations />
        <Chat />
        <Settings />
      </ContentContainer>
    </MainContainer>
  )
}

const MainContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
`

const NewButton = styled.button`
  -webkit-app-region: none;
  border-radius: 4px;
  color: var(--color-text-1);
  background-color: var(--color-background-soft);
  border: 1px solid var(--color-background-soft);
  &:hover {
    background-color: var(--color-background-soft-hover);
    cursor: pointer;
  }
`

const ContentContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: row;
`

const Conversations = styled.div`
  display: flex;
  min-width: var(--conversations-width);
  border-right: 1px solid #ffffff20;
  height: 100%;
`

const Chat = styled.div`
  display: flex;
  height: 100%;
  flex: 1;
  border-right: 1px solid #ffffff20;
`

const Settings = styled.div`
  display: flex;
  height: 100%;
  min-width: var(--settings-width);
`

export default HomePage
