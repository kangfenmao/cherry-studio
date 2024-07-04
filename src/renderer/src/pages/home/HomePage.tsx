import { Navbar, NavbarLeft, NavbarRight } from '@renderer/components/app/Navbar'
import { useAssistants } from '@renderer/hooks/useAssistant'
import { FC, useState } from 'react'
import styled from 'styled-components'
import Chat from './components/Chat/Chat'
import Assistants from './components/Assistants'
import { uuid } from '@renderer/utils'
import { getDefaultAssistant } from '@renderer/services/assistant'
import { useShowRightSidebar } from '@renderer/hooks/useStore'
import { Tooltip } from 'antd'
import NavigationCenter from './components/Chat/NavigationCenter'

const HomePage: FC = () => {
  const { assistants, addAssistant } = useAssistants()
  const [activeAssistant, setActiveAssistant] = useState(assistants[0])
  const { showRightSidebar, setShowRightSidebar } = useShowRightSidebar()

  const onCreateAssistant = () => {
    const _assistant = getDefaultAssistant()
    _assistant.id = uuid()
    addAssistant(_assistant)
    setActiveAssistant(_assistant)
  }

  return (
    <Container>
      <Navbar>
        <NavbarLeft style={{ justifyContent: 'flex-end', borderRight: 'none' }}>
          <NewButton onClick={onCreateAssistant}>
            <i className="iconfont icon-a-addchat"></i>
          </NewButton>
        </NavbarLeft>
        <NavigationCenter activeAssistant={activeAssistant} />
        <NavbarRight style={{ justifyContent: 'flex-end', padding: 5 }}>
          <Tooltip placement="left" title={showRightSidebar ? 'Hide Topics' : 'Show Topics'} arrow>
            <NewButton onClick={setShowRightSidebar}>
              <i className={`iconfont ${showRightSidebar ? 'icon-showsidebarhoriz' : 'icon-hidesidebarhoriz'}`} />
            </NewButton>
          </Tooltip>
        </NavbarRight>
      </Navbar>
      <ContentContainer>
        <Assistants activeAssistant={activeAssistant} onActive={setActiveAssistant} />
        <Chat assistant={activeAssistant} />
      </ContentContainer>
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  height: 100%;
`

const ContentContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: row;
  height: 100%;
`

const NewButton = styled.div`
  -webkit-app-region: none;
  border-radius: 4px;
  width: 34px;
  height: 34px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  transition: all 0.2s ease-in-out;
  color: var(--color-icon);
  .iconfont {
    font-size: 22px;
  }
  .icon-showsidebarhoriz,
  .icon-hidesidebarhoriz {
    font-size: 18px;
  }
  &:hover {
    background-color: var(--color-background-soft);
    cursor: pointer;
    color: var(--color-icon-white);
  }
`

export default HomePage
