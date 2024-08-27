import { TranslationOutlined } from '@ant-design/icons'
import { isMac } from '@renderer/config/constant'
import { AppLogo } from '@renderer/config/env'
import useAvatar from '@renderer/hooks/useAvatar'
import { useRuntime } from '@renderer/hooks/useStore'
import { Avatar } from 'antd'
import { FC } from 'react'
import { Link, useLocation } from 'react-router-dom'
import styled from 'styled-components'

import UserPopup from '../Popups/UserPopup'

const sidebarBackgroundColor = isMac ? 'var(--navbar-background-mac)' : 'var(--navbar-background)'

const Sidebar: FC = () => {
  const { pathname } = useLocation()
  const avatar = useAvatar()
  const { minappShow } = useRuntime()

  const isRoute = (path: string): string => (pathname === path ? 'active' : '')

  const onEditUser = () => {
    UserPopup.show()
  }

  return (
    <Container style={{ backgroundColor: minappShow ? 'var(--navbar-background)' : sidebarBackgroundColor }}>
      <AvatarImg src={avatar || AppLogo} draggable={false} className="nodrag" onClick={onEditUser} />
      <MainMenus>
        <Menus>
          <StyledLink to="/">
            <Icon className={isRoute('/')}>
              <i className="iconfont icon-chat"></i>
            </Icon>
          </StyledLink>
          <StyledLink to="/agents">
            <Icon className={isRoute('/agents')}>
              <i className="iconfont icon-business-smart-assistant"></i>
            </Icon>
          </StyledLink>
          <StyledLink to="/translate">
            <Icon className={isRoute('/translate')}>
              <TranslationOutlined />
            </Icon>
          </StyledLink>
          <StyledLink to="/apps">
            <Icon className={isRoute('/apps')}>
              <i className="iconfont icon-appstore"></i>
            </Icon>
          </StyledLink>
        </Menus>
      </MainMenus>
      <Menus>
        <StyledLink to="/settings/provider">
          <Icon className={pathname.startsWith('/settings') ? 'active' : ''}>
            <i className="iconfont icon-setting"></i>
          </Icon>
        </StyledLink>
      </Menus>
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 0;
  width: var(--sidebar-width);
  min-width: var(--sidebar-width);
  height: ${isMac ? 'calc(100vh - var(--navbar-height))' : '100vh'};
  -webkit-app-region: drag !important;
  border-right: 0.5px solid var(--color-border);
  margin-top: ${isMac ? 'var(--navbar-height)' : 0};
  background-color: ${sidebarBackgroundColor};
  transition: background-color 0.3s ease;
`

const AvatarImg = styled(Avatar)`
  width: 28px;
  height: 28px;
  background-color: var(--color-background-soft);
  margin-bottom: ${isMac ? '12px' : '12px'};
  margin-top: ${isMac ? '5px' : '2px'};
  border: none;
  cursor: pointer;
`
const MainMenus = styled.div`
  display: flex;
  flex: 1;
`

const Menus = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`

const Icon = styled.div`
  width: 34px;
  height: 34px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 6px;
  margin-bottom: 5px;
  transition: background-color 0.2s ease;
  -webkit-app-region: none;
  .iconfont,
  .anticon {
    color: var(--color-icon);
    font-size: 20px;
    transition: color 0.2s ease;
    text-decoration: none;
  }
  .anticon {
    font-size: 17px;
  }
  &:hover {
    background-color: var(--color-background-soft);
    cursor: pointer;
    .iconfont,
    .anticon {
      color: var(--color-icon-white);
    }
  }
  &.active {
    background-color: var(--color-background-mute);
    .iconfont,
    .anticon {
      color: var(--color-icon-white);
    }
  }
`

const StyledLink = styled(Link)`
  text-decoration: none;
  -webkit-app-region: none;
  &* {
    user-select: none;
  }
`

export default Sidebar
