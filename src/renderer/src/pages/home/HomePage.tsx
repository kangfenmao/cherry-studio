import { Navbar, NavbarLeft, NavbarRight } from '@renderer/components/app/Navbar'
import { useAssistants, useDefaultAssistant } from '@renderer/hooks/useAssistant'
import { FC, useState } from 'react'
import styled from 'styled-components'
import Chat from './components/Chat'
import Assistants from './components/Assistants'
import { uuid } from '@renderer/utils'
import { useShowAssistants, useShowRightSidebar } from '@renderer/hooks/useStore'
import Navigation from './components/NavigationCenter'
import { isMac, isWindows } from '@renderer/config/constant'

const HomePage: FC = () => {
  const { assistants, addAssistant } = useAssistants()
  const [activeAssistant, setActiveAssistant] = useState(assistants[0])
  const { rightSidebarShown, toggleRightSidebar } = useShowRightSidebar()
  const { showAssistants, toggleShowAssistants } = useShowAssistants()
  const { defaultAssistant } = useDefaultAssistant()

  const onCreateAssistant = () => {
    const assistant = { ...defaultAssistant, id: uuid() }
    addAssistant(assistant)
    setActiveAssistant(assistant)
  }

  return (
    <Container>
      <Navbar>
        {showAssistants && (
          <NavbarLeft style={{ justifyContent: 'space-between', borderRight: 'none', padding: '0 8px' }}>
            <NewButton onClick={toggleShowAssistants} style={{ marginLeft: isMac ? 8 : 0 }}>
              <i className="iconfont icon-hidesidebarhoriz" />
            </NewButton>
            <NewButton onClick={onCreateAssistant}>
              <i className="iconfont icon-a-addchat"></i>
            </NewButton>
          </NavbarLeft>
        )}
        <Navigation activeAssistant={activeAssistant} />
        <NavbarRight style={{ justifyContent: 'flex-end', paddingRight: isWindows ? 140 : 8 }}>
          <NewButton onClick={toggleRightSidebar}>
            <i className={`iconfont ${rightSidebarShown ? 'icon-showsidebarhoriz' : 'icon-hidesidebarhoriz'}`} />
          </NewButton>
        </NavbarRight>
      </Navbar>
      <ContentContainer>
        {showAssistants && (
          <Assistants
            activeAssistant={activeAssistant}
            setActiveAssistant={setActiveAssistant}
            onCreateAssistant={onCreateAssistant}
          />
        )}
        <Chat assistant={activeAssistant} />
      </ContentContainer>
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
`

const ContentContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: row;
`

export const NewButton = styled.div`
  -webkit-app-region: none;
  border-radius: 4px;
  width: 30px;
  height: 30px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  transition: all 0.2s ease-in-out;
  color: var(--color-icon);
  .icon-a-addchat {
    font-size: 20px;
  }
  .anticon {
    font-size: 19px;
  }
  .icon-showsidebarhoriz,
  .icon-hidesidebarhoriz {
    font-size: 17px;
  }
  &:hover {
    background-color: var(--color-background-soft);
    cursor: pointer;
    color: var(--color-icon-white);
  }
`

export default HomePage
