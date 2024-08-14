import { Navbar, NavbarLeft, NavbarRight } from '@renderer/components/app/Navbar'
import { isMac, isWindows } from '@renderer/config/constant'
import { useAssistants, useDefaultAssistant } from '@renderer/hooks/useAssistant'
import { useShowAssistants, useShowRightSidebar } from '@renderer/hooks/useStore'
import { useTheme } from '@renderer/providers/ThemeProvider'
import { Assistant } from '@renderer/types'
import { uuid } from '@renderer/utils'
import { Switch } from 'antd'
import { FC, useState } from 'react'
import styled from 'styled-components'

import Assistants from './Assistants'
import Chat from './Chat'
import AddAssistantPopup from './components/AddAssistantPopup'
import Navigation from './Header'

let _activeAssistant: Assistant

const HomePage: FC = () => {
  const { assistants, addAssistant } = useAssistants()
  const [activeAssistant, setActiveAssistant] = useState(_activeAssistant || assistants[0])
  const { rightSidebarShown, toggleRightSidebar } = useShowRightSidebar()
  const { showAssistants, toggleShowAssistants } = useShowAssistants()
  const { defaultAssistant } = useDefaultAssistant()
  const { theme, toggleTheme } = useTheme()

  _activeAssistant = activeAssistant

  const onCreateDefaultAssistant = () => {
    const assistant = { ...defaultAssistant, id: uuid() }
    addAssistant(assistant)
    setActiveAssistant(assistant)
  }

  const onCreateAssistant = async () => {
    const assistant = await AddAssistantPopup.show()
    assistant && setActiveAssistant(assistant)
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
        <NavbarRight style={{ justifyContent: 'flex-end', paddingRight: isWindows ? 140 : 12 }}>
          <ThemeSwitch
            checkedChildren={<i className="iconfont icon-theme icon-dark1" />}
            unCheckedChildren={<i className="iconfont icon-theme icon-theme-light" />}
            checked={theme === 'dark'}
            onChange={toggleTheme}
          />
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
            onCreateAssistant={onCreateDefaultAssistant}
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
  background-color: var(--color-background);
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

const ThemeSwitch = styled(Switch)`
  -webkit-app-region: none;
  margin-right: 10px;
  .icon-theme {
    font-size: 14px;
  }
`

export default HomePage
