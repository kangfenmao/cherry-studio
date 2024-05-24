import { Navbar, NavbarCenter, NavbarLeft, NavbarRight } from '@renderer/components/app/Navbar'
import { FC } from 'react'
import styled from 'styled-components'

const HomePage: FC = () => {
  return (
    <MainContainer>
      <Navbar>
        <NavbarLeft />
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
