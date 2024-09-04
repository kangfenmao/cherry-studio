import { Navbar, NavbarCenter, NavbarLeft, NavbarRight } from '@renderer/components/app/Navbar'
import AddAssistantPopup from '@renderer/components/Popups/AddAssistantPopup'
import { isMac, isWindows } from '@renderer/config/constant'
import { useTheme } from '@renderer/context/ThemeProvider'
import { useAssistant } from '@renderer/hooks/useAssistant'
import { useShowAssistants, useShowRightSidebar } from '@renderer/hooks/useStore'
import { Assistant } from '@renderer/types'
import { removeLeadingEmoji } from '@renderer/utils'
import { Switch } from 'antd'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import SelectModelButton from './components/SelectModelButton'

interface Props {
  activeAssistant: Assistant
  setActiveAssistant: (assistant: Assistant) => void
}

const HeaderNavbar: FC<Props> = ({ activeAssistant, setActiveAssistant }) => {
  const { assistant } = useAssistant(activeAssistant.id)
  const { t } = useTranslation()
  const { showAssistants, toggleShowAssistants } = useShowAssistants()
  const { rightSidebarShown, toggleRightSidebar } = useShowRightSidebar()
  const { theme, toggleTheme } = useTheme()

  const onCreateAssistant = async () => {
    const assistant = await AddAssistantPopup.show()
    assistant && setActiveAssistant(assistant)
  }

  return (
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
      <NavbarCenter style={{ paddingLeft: isMac ? 16 : 8 }}>
        {!showAssistants && (
          <NewButton onClick={toggleShowAssistants} style={{ marginRight: isMac ? 8 : 25 }}>
            <i className="iconfont icon-showsidebarhoriz" />
          </NewButton>
        )}
        <AssistantName>{removeLeadingEmoji(assistant?.name) || t('chat.default.name')}</AssistantName>
        <SelectModelButton assistant={assistant} />
      </NavbarCenter>
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
  )
}

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
  cursor: pointer;
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
    background-color: var(--color-background-mute);
    color: var(--color-icon-white);
  }
`

const AssistantName = styled.span`
  margin-left: 5px;
  margin-right: 10px;
  font-family: Ubuntu;
`

const ThemeSwitch = styled(Switch)`
  -webkit-app-region: none;
  margin-right: 10px;
  .icon-theme {
    font-size: 14px;
  }
`

export default HeaderNavbar
