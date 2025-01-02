import { useTheme } from '@renderer/context/ThemeProvider'
import { useSettings } from '@renderer/hooks/useSettings'
import { useAppDispatch } from '@renderer/store'
import { setClickTrayToShowQuickAssistant } from '@renderer/store/settings'
import HomeWindow from '@renderer/windows/mini/home/HomeWindow'
import { Switch } from 'antd'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { SettingContainer, SettingDivider, SettingGroup, SettingRow, SettingRowTitle, SettingTitle } from '.'

const QuickAssistantSettings: FC = () => {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const { clickTrayToShowQuickAssistant, setTray } = useSettings()
  const dispatch = useAppDispatch()

  const handleClickTrayToShowQuickAssistant = async (checked: boolean) => {
    dispatch(setClickTrayToShowQuickAssistant(checked))
    await window.api.config.set('clickTrayToShowQuickAssistant', checked)
    if (checked) {
      setTray(true)
      window.api.setTray(true)
    }
  }

  return (
    <SettingContainer theme={theme}>
      <SettingGroup theme={theme}>
        <SettingTitle>{t('settings.quickAssistant.title')}</SettingTitle>
        <SettingDivider />
        <SettingRow>
          <SettingRowTitle>{t('settings.quickAssistant.click_tray_to_show')}</SettingRowTitle>
          <Switch checked={clickTrayToShowQuickAssistant} onChange={handleClickTrayToShowQuickAssistant} />
        </SettingRow>
      </SettingGroup>
      <AssistantContainer onClick={() => {}}>
        <HomeWindow />
      </AssistantContainer>
    </SettingContainer>
  )
}

const AssistantContainer = styled.div`
  width: 100%;
  height: 460px;
  background-color: var(--color-background);
  border-radius: 10px;
  border: 0.5px solid var(--color-border);
  margin: 0 auto;
`

export default QuickAssistantSettings
