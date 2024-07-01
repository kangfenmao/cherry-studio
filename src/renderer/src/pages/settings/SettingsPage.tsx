import { Navbar, NavbarCenter } from '@renderer/components/app/Navbar'
import { FC } from 'react'
import { Link, Route, Routes, useLocation } from 'react-router-dom'
import styled from 'styled-components'
import SettingsHomePage from './GeneralSetting'
import SettingsDeveloperPage from './DeveloperSetting'
import SettingsAboutPage from './AboutSetting'
import SettingsModelsPage from './ModelsSetting'
import SettingsDefaultAgent from './DefaultAgentSetting'

const SettingsPage: FC = () => {
  const { pathname } = useLocation()

  const isRoute = (path: string): string => (pathname === path ? 'active' : '')

  return (
    <Container>
      <Navbar>
        <NavbarCenter>Settings</NavbarCenter>
      </Navbar>
      <ContentContainer>
        <SettingMenus>
          <MenuItemLink to="/settings/general">
            <MenuItem className={isRoute('/settings/general')}>General</MenuItem>
          </MenuItemLink>
          <MenuItemLink to="/settings/models">
            <MenuItem className={isRoute('/settings/models')}>Language Model</MenuItem>
          </MenuItemLink>
          <MenuItemLink to="/settings/default-agent">
            <MenuItem className={isRoute('/settings/default-agent')}>Default Agent</MenuItem>
          </MenuItemLink>
          <MenuItemLink to="/settings/about">
            <MenuItem className={isRoute('/settings/about')}>About</MenuItem>
          </MenuItemLink>
          <MenuItemLink to="/settings/developer">
            <MenuItem className={isRoute('/settings/developer')}>Developer</MenuItem>
          </MenuItemLink>
        </SettingMenus>
        <SettingContent>
          <Routes>
            <Route path="general" element={<SettingsHomePage />} />
            <Route path="models" element={<SettingsModelsPage />} />
            <Route path="default-agent" element={<SettingsDefaultAgent />} />
            <Route path="about" element={<SettingsAboutPage />} />
            <Route path="developer" element={<SettingsDeveloperPage />} />
          </Routes>
        </SettingContent>
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

const SettingMenus = styled.ul`
  display: flex;
  flex-direction: column;
  min-width: var(--agents-width);
  border-right: 1px solid #ffffff20;
  padding: 10px;
`

const MenuItemLink = styled(Link)`
  text-decoration: none;
  color: var(--color-text-1);
  margin-bottom: 5px;
`

const MenuItem = styled.li`
  padding: 6px 10px;
  width: 100%;
  cursor: pointer;
  border-radius: 5px;
  font-size: 14px;
  transition: all 0.2s ease-in-out;
  &:hover {
    background: #213675;
  }
  &.active {
    background: #213675;
  }
`

const SettingContent = styled.div`
  display: flex;
  height: 100%;
  flex: 1;
  border-right: 1px solid #ffffff20;
  padding: 20px;
`

export default SettingsPage
