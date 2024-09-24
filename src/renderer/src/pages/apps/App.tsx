import MinApp from '@renderer/components/MinApp'
import { MinAppType } from '@renderer/types'
import { FC } from 'react'
import styled from 'styled-components'

interface Props {
  app: MinAppType
}

const App: FC<Props> = ({ app }) => {
  const onClick = () => {
    MinApp.start(app)
  }

  return (
    <Container onClick={onClick}>
      <AppIcon src={app.logo} style={{ border: app.bodered ? '0.5px solid var(--color-border)' : 'none' }} />
      <AppTitle>{app.name}</AppTitle>
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  width: 65px;
`

const AppIcon = styled.img`
  width: 60px;
  height: 60px;
  border-radius: 16px;
  user-select: none;
  -webkit-user-drag: none;
`

const AppTitle = styled.div`
  font-size: 12px;
  margin-top: 5px;
  color: var(--color-text-soft);
  text-align: center;
  user-select: none;
`

export default App
