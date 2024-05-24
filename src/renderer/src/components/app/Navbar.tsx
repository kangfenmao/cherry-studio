import { FC, PropsWithChildren } from 'react'
import styled from 'styled-components'

interface Props extends PropsWithChildren {}

export const Navbar: FC<Props> = ({ children }) => {
  return <NavbarContainer>{children}</NavbarContainer>
}

export const NavbarLeft: FC<Props> = ({ children }) => {
  return <NavbarLeftContainer>{children}</NavbarLeftContainer>
}

export const NavbarCenter: FC<Props> = ({ children }) => {
  return <NavbarCenterContainer>{children}</NavbarCenterContainer>
}

export const NavbarRight: FC<Props> = ({ children }) => {
  return <NavbarRightContainer>{children}</NavbarRightContainer>
}

const NavbarContainer = styled.div`
  min-width: 100%;
  display: flex;
  flex-direction: row;
  height: var(--navbar-height);
  border-bottom: 1px solid #ffffff20;
  -webkit-app-region: drag;
`

const NavbarLeftContainer = styled.div`
  min-width: var(--conversations-width);
  border-right: 1px solid #ffffff20;
`

const NavbarCenterContainer = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  font-size: 14px;
  font-weight: bold;
  color: var(--color-text-1);
  text-align: center;
  border-right: 1px solid #ffffff20;
  padding: 0 16px;
`

const NavbarRightContainer = styled.div`
  min-width: var(--settings-width);
`
