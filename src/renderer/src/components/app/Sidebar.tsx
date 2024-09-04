import { TranslationOutlined } from '@ant-design/icons'
import { isMac } from '@renderer/config/constant'
import { isLocalAi, UserAvatar } from '@renderer/config/env'
import useAvatar from '@renderer/hooks/useAvatar'
import { useSettings } from '@renderer/hooks/useSettings'
import { useRuntime, useShowAssistants } from '@renderer/hooks/useStore'
import { Avatar } from 'antd'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'
import styled from 'styled-components'

import UserPopup from '../Popups/UserPopup'

const Sidebar: FC = () => {
  const { pathname } = useLocation()
  const avatar = useAvatar()
  const { minappShow } = useRuntime()
  const { toggleShowAssistants } = useShowAssistants()
  const { generating } = useRuntime()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { windowStyle } = useSettings()

  const isRoute = (path: string): string => (pathname === path ? 'active' : '')

  const onEditUser = () => UserPopup.show()

  const macTransparentWindow = isMac && windowStyle === 'transparent'
  const sidebarBgColor = macTransparentWindow ? 'var(--navbar-background-mac)' : 'var(--navbar-background)'

  const to = (path: string) => {
    if (generating) {
      window.message.warning({ content: t('message.switch.disabled'), key: 'switch-assistant' })
      return
    }
    navigate(path)
  }

  const onToggleShowAssistants = () => {
    pathname === '/' ? toggleShowAssistants() : navigate('/')
  }

  return (
    <Container style={{ backgroundColor: minappShow ? 'var(--navbar-background)' : sidebarBgColor }}>
      <AvatarImg src={avatar || UserAvatar} draggable={false} className="nodrag" onClick={onEditUser} />
      <MainMenus>
        <Menus>
          <StyledLink onClick={onToggleShowAssistants}>
            <Icon className={isRoute('/')}>
              <i className="iconfont icon-chat"></i>
            </Icon>
          </StyledLink>
          <StyledLink onClick={() => to('/agents')}>
            <Icon className={isRoute('/agents')}>
              <i className="iconfont icon-business-smart-assistant"></i>
            </Icon>
          </StyledLink>
          <StyledLink onClick={() => to('/translate')}>
            <Icon className={isRoute('/translate')}>
              <TranslationOutlined />
            </Icon>
          </StyledLink>
          <StyledLink onClick={() => to('/apps')}>
            <Icon className={isRoute('/apps')}>
              <i className="iconfont icon-appstore"></i>
            </Icon>
          </StyledLink>
        </Menus>
      </MainMenus>
      <Menus>
        <StyledLink onClick={() => to(isLocalAi ? '/settings/assistant' : '/settings/provider')}>
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

const StyledLink = styled.div`
  text-decoration: none;
  -webkit-app-region: none;
  &* {
    user-select: none;
  }
`

export default Sidebar
