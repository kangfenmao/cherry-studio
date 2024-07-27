import { FC } from 'react'
import Logo from '@renderer/assets/images/logo.png'
import styled from 'styled-components'
import { Link, useLocation } from 'react-router-dom'
import useAvatar from '@renderer/hooks/useAvatar'
import { isMac, isWindows } from '@renderer/config/constant'
import { TranslationOutlined } from '@ant-design/icons'

const Sidebar: FC = () => {
  const { pathname } = useLocation()
  const avatar = useAvatar()

  const isRoute = (path: string): string => (pathname === path ? 'active' : '')

  return (
    <Container style={isWindows ? { paddingTop: 0 } : {}}>
      {isMac ? <PlaceholderBorderMac /> : <PlaceholderBorderWin />}
      <StyledLink to="/">
        <AvatarImg src={avatar || Logo} draggable={false} />
      </StyledLink>
      <MainMenus>
        <Menus>
          <StyledLink to="/">
            <Icon className={isRoute('/')}>
              <i className="iconfont icon-chat"></i>
            </Icon>
          </StyledLink>
          <StyledLink to="/apps">
            <Icon className={isRoute('/apps')}>
              <i className="iconfont icon-appstore"></i>
            </Icon>
          </StyledLink>
          <StyledLink to="/translate">
            <Icon className={isRoute('/translate')}>
              <TranslationOutlined />
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
  min-width: var(--sidebar-width);
  min-height: 100%;
  -webkit-app-region: drag !important;
  background-color: #1f1f1f;
  border-right: 0.5px solid var(--color-border);
  padding-top: var(--navbar-height);
  position: relative;
`

const AvatarImg = styled.img`
  border-radius: 50%;
  width: 28px;
  height: 28px;
  background-color: var(--color-background-soft);
  margin: 5px 0;
  margin-top: ${isMac ? '16px' : '7px'};
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
    background-color: #ffffff30;
    cursor: pointer;
    .iconfont,
    .anticon {
      color: var(--color-icon-white);
    }
  }
  &.active {
    background-color: #ffffff20;
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

const PlaceholderBorderMac = styled.div`
  width: var(--sidebar-width);
  height: var(--navbar-height);
  background: var(--navbar-background);
  border-right: 1px solid var(--navbar-background);
  border-bottom: 0.5px solid var(--color-border);
  position: absolute;
  top: 0;
  left: 0;
`

const PlaceholderBorderWin = styled.div`
  width: var(--sidebar-width);
  height: var(--navbar-height);
  position: absolute;
  border-right: 1px solid var(--navbar-background);
  top: -1px;
  right: -1px;
`

export default Sidebar
