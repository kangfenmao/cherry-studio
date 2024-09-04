import { FormOutlined } from '@ant-design/icons'
import { Navbar, NavbarCenter, NavbarLeft, NavbarRight } from '@renderer/components/app/Navbar'
import { HStack } from '@renderer/components/Layout'
import AddAssistantPopup from '@renderer/components/Popups/AddAssistantPopup'
import { isMac, isWindows } from '@renderer/config/constant'
import { useTheme } from '@renderer/context/ThemeProvider'
import { useAssistant } from '@renderer/hooks/useAssistant'
import { useShowAssistants, useShowTopics } from '@renderer/hooks/useStore'
import { getDefaultTopic } from '@renderer/services/assistant'
import { Assistant, Topic } from '@renderer/types'
import { Switch } from 'antd'
import { FC, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

interface Props {
  activeAssistant: Assistant
  activeTopic: Topic
  setActiveAssistant: (assistant: Assistant) => void
  setActiveTopic: (topic: Topic) => void
}

const HeaderNavbar: FC<Props> = ({ activeAssistant, setActiveAssistant, setActiveTopic }) => {
  const { assistant, addTopic } = useAssistant(activeAssistant.id)
  const { t } = useTranslation()
  const { showAssistants, toggleShowAssistants } = useShowAssistants()
  const { showTopics } = useShowTopics()
  const { theme, toggleTheme } = useTheme()

  const onCreateAssistant = async () => {
    const assistant = await AddAssistantPopup.show()
    assistant && setActiveAssistant(assistant)
  }

  const addNewTopic = useCallback(() => {
    const topic = getDefaultTopic()
    addTopic(topic)
    setActiveTopic(topic)
  }, [addTopic, setActiveTopic])

  return (
    <Navbar>
      {showAssistants && (
        <NavbarLeft style={{ justifyContent: 'space-between', borderRight: 'none', padding: '0 8px' }}>
          <NewButton onClick={toggleShowAssistants} style={{ marginLeft: isMac ? 8 : 0 }}>
            <i className="iconfont icon-sidebar-right" />
          </NewButton>
          <NewButton onClick={onCreateAssistant} style={{ marginRight: 6 }}>
            <i className="iconfont icon-a-addchat" />
          </NewButton>
        </NavbarLeft>
      )}
      {showTopics && (
        <NavbarCenter
          style={{
            paddingLeft: isMac && !showAssistants ? 16 : 8,
            paddingRight: 8,
            maxWidth: 'var(--topic-list-width)',
            justifyContent: 'space-between'
          }}>
          <HStack alignItems="center">
            {!showAssistants && (
              <NewButton onClick={toggleShowAssistants} style={{ marginRight: isMac ? 8 : 25 }}>
                <i className="iconfont icon-sidebar-left" />
              </NewButton>
            )}
            {showAssistants && (
              <TitleText>
                {t('chat.topics.title')} ({assistant.topics.length})
              </TitleText>
            )}
          </HStack>
          <NewButton onClick={addNewTopic}>
            <FormOutlined />
          </NewButton>
        </NavbarCenter>
      )}
      <NavbarRight style={{ justifyContent: 'space-between', paddingRight: isWindows ? 130 : 12, flex: 1 }}>
        <HStack alignItems="center">
          {!showAssistants && !showTopics && (
            <NewButton
              onClick={() => toggleShowAssistants()}
              style={{ marginRight: isMac ? 8 : 25, marginLeft: isMac ? 8 : 0 }}>
              <i className="iconfont icon-sidebar-left" />
            </NewButton>
          )}
          <TitleText>
            {assistant.name}
            {/* {!showTopics && <HashTag onClick={() => toggleShowTopics()}>#{activeTopic.name}#</HashTag>} */}
          </TitleText>
        </HStack>
        <HStack alignItems="center">
          <ThemeSwitch
            checkedChildren={<i className="iconfont icon-theme icon-dark1" />}
            unCheckedChildren={<i className="iconfont icon-theme icon-theme-light" />}
            checked={theme === 'dark'}
            onChange={toggleTheme}
          />
        </HStack>
      </NavbarRight>
    </Navbar>
  )
}

export const NewButton = styled.div`
  -webkit-app-region: none;
  border-radius: 4px;
  height: 30px;
  padding: 0 8px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  transition: all 0.2s ease-in-out;
  cursor: pointer;
  .iconfont {
    font-size: 18px;
    color: var(--color-icon);
  }
  .icon-a-addchat {
    font-size: 20px;
  }
  .anticon {
    color: var(--color-icon);
    font-size: 17px;
  }
  &:hover {
    background-color: var(--color-background-mute);
    color: var(--color-icon-white);
  }
`

const TitleText = styled.span`
  margin-left: 5px;
  font-family: Ubuntu;
  font-size: 13px;
`

const ThemeSwitch = styled(Switch)`
  -webkit-app-region: no-drag;
  margin-right: 10px;
  .icon-theme {
    font-size: 14px;
  }
`

// const HashTag = styled.span`
//   -webkit-app-region: no-drag;
//   color: var(--color-primary);
//   margin-left: 5px;
//   user-select: none;
//   cursor: pointer;
//   &:hover {
//     text-decoration: underline;
//   }
// `

export default HeaderNavbar
