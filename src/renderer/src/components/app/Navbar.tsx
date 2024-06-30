import { FC, PropsWithChildren } from 'react'
import styled from 'styled-components'

type Props = PropsWithChildren & JSX.IntrinsicElements['div']

export const Navbar: FC<Props> = ({ children, ...props }) => {
  return <NavbarContainer {...props}>{children}</NavbarContainer>
}

export const NavbarLeft: FC<Props> = ({ children, ...props }) => {
  return <NavbarLeftContainer {...props}>{children}</NavbarLeftContainer>
}

export const NavbarCenter: FC<Props> = ({ children, ...props }) => {
  return <NavbarCenterContainer {...props}>{children}</NavbarCenterContainer>
}

export const NavbarRight: FC<Props> = ({ children, ...props }) => {
  return <NavbarRightContainer {...props}>{children}</NavbarRightContainer>
}

const NavbarContainer = styled.div`
  min-width: 100%;
  display: flex;
  flex-direction: row;
  min-height: var(--navbar-height);
  max-height: var(--navbar-height);
  background-color: #111;
  border-bottom: 1px solid #ffffff20;
  -webkit-app-region: drag;
`

const NavbarLeftContainer = styled.div`
  min-width: var(--conversations-width);
  border-right: 1px solid #ffffff20;
  padding: 0 16px;
  display: flex;
  flex-direction: row;
  align-items: center;
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
  display: flex;
  align-items: center;
  padding: 0 16px;
`
