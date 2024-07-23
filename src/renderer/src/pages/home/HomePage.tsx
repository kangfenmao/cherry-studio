import { Navbar, NavbarLeft, NavbarRight } from '@renderer/components/app/Navbar'
import { useAssistants, useDefaultAssistant } from '@renderer/hooks/useAssistant'
import { FC, useState } from 'react'
import styled from 'styled-components'
import Chat from './components/Chat'
import Assistants from './components/Assistants'
import { uuid } from '@renderer/utils'
import { useShowAssistants, useShowRightSidebar } from '@renderer/hooks/useStore'
import { Tooltip } from 'antd'
import Navigation from './components/Navigation'
import { useTranslation } from 'react-i18next'
import { PlusCircleOutlined } from '@ant-design/icons'

const HomePage: FC = () => {
  const { assistants, addAssistant } = useAssistants()
  const [activeAssistant, setActiveAssistant] = useState(assistants[0])
  const { showRightSidebar, toggleRightSidebar } = useShowRightSidebar()
  const { showAssistants, toggleShowAssistants } = useShowAssistants()
  const { defaultAssistant } = useDefaultAssistant()
  const { t } = useTranslation()

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
            <NewButton onClick={toggleShowAssistants} style={{ marginLeft: 8 }}>
              <i className="iconfont icon-hidesidebarhoriz" />
            </NewButton>
            <NewButton onClick={onCreateAssistant}>
              <PlusCircleOutlined />
            </NewButton>
          </NavbarLeft>
        )}
        <Navigation activeAssistant={activeAssistant} />
        <NavbarRight style={{ justifyContent: 'flex-end', padding: '0 7px' }}>
          <Tooltip
            placement="left"
            title={showRightSidebar ? t('assistant.topics.hide_topics') : t('assistant.topics.show_topics')}
            arrow>
            <NewButton onClick={toggleRightSidebar}>
              <i className={`iconfont ${showRightSidebar ? 'icon-showsidebarhoriz' : 'icon-hidesidebarhoriz'}`} />
            </NewButton>
          </Tooltip>
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
