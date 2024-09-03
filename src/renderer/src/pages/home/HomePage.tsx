import { ArrowLeftOutlined } from '@ant-design/icons'
import { Navbar, NavbarCenter, NavbarLeft, NavbarRight } from '@renderer/components/app/Navbar'
import { isMac, isWindows } from '@renderer/config/constant'
import { useTheme } from '@renderer/context/ThemeProvider'
import { useAssistant, useAssistants, useDefaultAssistant } from '@renderer/hooks/useAssistant'
import { useShowAssistants } from '@renderer/hooks/useStore'
import { useActiveTopic } from '@renderer/hooks/useTopic'
import { getDefaultTopic } from '@renderer/services/assistant'
import { Assistant, Topic } from '@renderer/types'
import { uuid } from '@renderer/utils'
import { Switch } from 'antd'
import { FC, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import AddAssistantPopup from '../../components/Popups/AddAssistantPopup'
import Assistants from './Assistants'
import Chat from './Chat'
import SelectModelButton from './components/SelectModelButton'

let _activeAssistant: Assistant
let _showTopics = false

const HomePage: FC = () => {
  const { assistants, addAssistant } = useAssistants()
  const [activeAssistant, setActiveAssistant] = useState(_activeAssistant || assistants[0])
  const { showAssistants } = useShowAssistants()
  const { defaultAssistant } = useDefaultAssistant()
  const { theme, toggleTheme } = useTheme()
  const [showTopics, setShowTopics] = useState(_showTopics)
  const { t } = useTranslation()

  const { activeTopic, setActiveTopic } = useActiveTopic(activeAssistant)
  const { addTopic } = useAssistant(activeAssistant.id)

  _activeAssistant = activeAssistant
  _showTopics = showTopics

  const onCreateDefaultAssistant = () => {
    const assistant = { ...defaultAssistant, id: uuid() }
    addAssistant(assistant)
    setActiveAssistant(assistant)
  }

  const onCreate = async () => {
    if (showTopics) {
      const topic = getDefaultTopic()
      addTopic(topic)
      setActiveTopic(topic)
    } else {
      const assistant = await AddAssistantPopup.show()
      assistant && setActiveAssistant(assistant)
    }
  }

  const onSetActiveTopic = (topic: Topic) => {
    setActiveTopic(topic)
    setShowTopics(true)
  }

  return (
    <Container>
      <Navbar>
        {showAssistants && (
          <NavbarLeft
            style={{ justifyContent: 'space-between', alignItems: 'center', borderRight: 'none', padding: '0 8px' }}>
            <NavigtaionBack onClick={() => setShowTopics(false)} style={{ opacity: showTopics ? 1 : 0 }}>
              <ArrowLeftOutlined />
              <NavigationBackTitle>{t('common.back')}</NavigationBackTitle>
            </NavigtaionBack>
            <NewButton onClick={onCreate}>
              <i className="iconfont icon-a-addchat"></i>
            </NewButton>
          </NavbarLeft>
        )}
        <NavbarCenter style={{ paddingLeft: isMac ? 16 : 8 }}>
          <AssistantName>{activeAssistant?.name || t('chat.default.name')}</AssistantName>
          <SelectModelButton assistant={activeAssistant} />
        </NavbarCenter>
        <NavbarRight style={{ justifyContent: 'flex-end', paddingRight: isWindows ? 140 : 12 }}>
          <ThemeSwitch
            checkedChildren={<i className="iconfont icon-theme icon-dark1" />}
            unCheckedChildren={<i className="iconfont icon-theme icon-theme-light" />}
            checked={theme === 'dark'}
            onChange={toggleTheme}
          />
        </NavbarRight>
      </Navbar>
      <ContentContainer>
        {showAssistants && (
          <Assistants
            activeAssistant={activeAssistant}
            setActiveAssistant={setActiveAssistant}
            activeTopic={activeTopic}
            setActiveTopic={setActiveTopic}
            showTopics={showTopics}
            setShowTopics={setShowTopics}
            onCreateAssistant={onCreateDefaultAssistant}
          />
        )}
        <Chat assistant={activeAssistant} activeTopic={activeTopic} setActiveTopic={onSetActiveTopic} />
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

const NavigtaionBack = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
  cursor: pointer;
  margin-left: ${isMac ? '16px' : '4px'};
  -webkit-app-region: none;
  transition: all 0.2s ease-in-out;
  color: var(--color-icon);
  transition: opacity 0.2s ease-in-out;
  &:hover {
    color: var(--color-text-2);
  }
`

const NavigationBackTitle = styled.div`
  font-size: 13px;
  font-weight: 500;
`

const AssistantName = styled.span`
  margin-left: 5px;
  margin-right: 10px;
  font-family: Ubuntu;
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
