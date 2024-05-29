import { Navbar, NavbarCenter } from '@renderer/components/app/Navbar'
import { FC } from 'react'
import styled from 'styled-components'

const SettingsPage: FC = () => {
  return (
    <Container>
      <Navbar>
        <NavbarCenter>Settings</NavbarCenter>
      </Navbar>
      <ContentContainer>
        <SettingMenus></SettingMenus>
      </ContentContainer>
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`

const ContentContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: row;
`

const SettingMenus = styled.div`
  display: flex;
  min-width: var(--conversations-width);
  border-right: 1px solid #ffffff20;
  height: 100%;
  padding: 10px;
`

export default SettingsPage
