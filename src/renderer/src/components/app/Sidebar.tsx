import { FC } from 'react'
import Logo from '@renderer/assets/images/electron.svg'
import AppIcon from '@renderer/assets/images/sidebar_app_active.png'
import MessageIcon from '@renderer/assets/images/sidebar_message_active.png'
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
      <Menus>
        <Link to="/">
          <Icon className={isRoute('/')}>
            <IconImage src={MessageIcon} />
          </Icon>
        </Link>
        <Link to="/apps">
          <Icon className={isRoute('/apps')}>
            <IconImage src={AppIcon} />
          </Icon>
        </Link>
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
`

const Avatar = styled.div``
const AvatarImg = styled.img`
  border-radius: 50%;
  width: 36px;
  height: 36px;
  background-color: var(--color-background-soft);
  margin: 5px 0;
`
const Menus = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`

const Icon = styled.div`
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 4px;
  margin-bottom: 5px;
  transition: background-color 0.2s ease;
  &:hover {
    background-color: #ffffff30;
    cursor: pointer;
    .icon-img {
      filter: invert(1);
    }
  }
  &.active {
    background-color: #ffffff20;
    .icon-img {
      filter: invert(1);
    }
  }
`

const IconImage = styled.img`
  width: 20px;
  height: 20px;
  filter: invert(0.6);
  transition: filter 0.2s ease;
`

export default Sidebar
