import { Navbar, NavbarCenter } from '@renderer/components/app/Navbar'
import { FC } from 'react'
import styled from 'styled-components'

const AppsPage: FC = () => {
  return (
    <Container>
      <Navbar>
        <NavbarCenter>Assistant Market</NavbarCenter>
      </Navbar>
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex: 1;
`

export default AppsPage
