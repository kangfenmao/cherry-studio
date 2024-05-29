import { FC } from 'react'
import Logo from '@renderer/assets/images/logo.png'
import styled from 'styled-components'
import { Link, useLocation } from 'react-router-dom'

const Sidebar: FC = () => {
  const { pathname } = useLocation()

  const isRoute = (path: string): string => (pathname === path ? 'active' : '')

  return (
    <Container>
      <Avatar>
        <AvatarImg src={Logo} />
      </Avatar>
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
        </Menus>
      </MainMenus>
      <Menus>
        <StyledLink to="/settings/general">
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
  padding: 16px 0;
  min-width: var(--sidebar-width);
  min-height: 100%;
  border-top: 1px solid #ffffff20;
  border-right: 1px solid #ffffff20;
  margin-top: 47px;
  padding-bottom: 52px;
`

const Avatar = styled.div``

const AvatarImg = styled.img`
  border-radius: 50%;
  width: 32px;
  height: 32px;
  background-color: var(--color-background-soft);
  margin: 5px 0;
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
  width: 36px;
  height: 36px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 6px;
  margin-bottom: 5px;
  transition: background-color 0.2s ease;
  .iconfont {
    color: var(--color-icon);
    font-size: 22px;
    transition: color 0.2s ease;
    text-decoration: none;
  }
  &:hover {
    background-color: #ffffff30;
    cursor: pointer;
    .iconfont {
      color: var(--color-icon-white);
    }
  }
  &.active {
    background-color: #ffffff20;
    .iconfont {
      color: var(--color-icon-white);
    }
  }
`

const StyledLink = styled(Link)`
  text-decoration: none;
`

export default Sidebar
