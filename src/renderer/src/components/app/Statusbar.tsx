import { FC } from 'react'
import styled from 'styled-components'

const Statusbar: FC = () => {
  return (
    <Container>
      <StatusbarLeft />
      <StatusbarCenter />
      <StatusbarRight>Cherry AI v0.1.0</StatusbarRight>
    </Container>
  )
}

const Container = styled.div`
  min-height: var(--status-bar-height);
  border-top: 1px solid var(--color-border);
  display: flex;
  flex-direction: row;
  position: absolute;
  bottom: 0;
  left: var(--sidebar-width);
  right: 0;
  background-color: #0b0a09;
`

const StatusbarLeft = styled.div`
  min-width: var(--sidebar-width) + var(--agents-width);
`

const StatusbarCenter = styled.div`
  flex: 1;
  display: flex;
`

const StatusbarRight = styled.div`
  min-width: var(--settings-width);
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  font-size: 12px;
  color: var(--color-text-2);
  padding-right: 16px;
`

export default Statusbar
