import { ArrowLeftOutlined, UnorderedListOutlined } from '@ant-design/icons'
import { Navbar, NavbarCenter, NavbarLeft } from '@renderer/components/app/Navbar'
import { HStack } from '@renderer/components/Layout'
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
  }

  return (
    <Container>
      <Navbar>
        {showAssistants && (
          <NavbarLeft
            style={{ justifyContent: 'space-between', alignItems: 'center', borderRight: 'none', padding: '0 8px' }}>
            <NewButton onClick={() => setShowTopics(!showTopics)} className="back-button">
              {showTopics ? <ArrowLeftOutlined /> : <UnorderedListOutlined />}
              <BackText>{showTopics ? t('common.assistant') : t('chat.topics.title')}</BackText>
            </NewButton>
            <NewButton onClick={onCreate}>
              <i className="iconfont icon-a-addchat"></i>
            </NewButton>
          </NavbarLeft>
        )}
        <NavbarCenter
          style={{ justifyContent: 'space-between', paddingLeft: isMac ? 16 : 8, paddingRight: isWindows ? 135 : 12 }}>
          <HStack alignItems="center">
            <AssistantName>{activeAssistant?.name || t('chat.default.name')}</AssistantName>
            <SelectModelButton assistant={activeAssistant} />
          </HStack>
          <ThemeSwitch
            checkedChildren={<i className="iconfont icon-theme icon-dark1" />}
            unCheckedChildren={<i className="iconfont icon-theme icon-theme-light" />}
            checked={theme === 'dark'}
            onChange={toggleTheme}
          />
        </NavbarCenter>
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

const AssistantName = styled.span`
  margin-left: 5px;
  margin-right: 10px;
  font-family: Ubuntu;
  font-size: 13px;
  font-weight: 500;
`

export const NewButton = styled.div`
  -webkit-app-region: none;
  border-radius: 4px;
  padding: 0 5px;
  height: 30px;
  gap: 5px;
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
  &.back-button {
    margin-left: ${isMac ? '8px' : 0};
    .anticon {
      font-size: 16px;
    }
    .anticon-arrow-left {
      font-size: 14px;
    }
    &:hover {
      background-color: var(--color-background-mute);
      color: var(--color-icon-white);
    }
  }
  &:hover {
    background-color: var(--color-background-mute);
    cursor: pointer;
    color: var(--color-icon-white);
  }
`

const BackText = styled.span`
  font-size: 12px;
  font-weight: 400;
`

const ThemeSwitch = styled(Switch)`
  -webkit-app-region: none;
  margin-right: 10px;
  .icon-theme {
    font-size: 14px;
  }
`

export default HomePage
