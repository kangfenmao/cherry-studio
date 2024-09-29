import { FolderOpenOutlined, SaveOutlined } from '@ant-design/icons'
import { HStack, VStack } from '@renderer/components/Layout'
import { isMac } from '@renderer/config/constant'
import { useSettings } from '@renderer/hooks/useSettings'
import i18n from '@renderer/i18n'
import { backup, reset, restore } from '@renderer/services/backup'
import { useAppDispatch } from '@renderer/store'
import { setClickAssistantToShowTopic, setLanguage, setManualUpdateCheck } from '@renderer/store/settings'
import { setProxyUrl as _setProxyUrl } from '@renderer/store/settings'
import { ThemeMode } from '@renderer/types'
import { isValidProxyUrl } from '@renderer/utils'
import { Button, Input, Select, Switch } from 'antd'
import { FC, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, Route, Routes } from 'react-router-dom'

import { SettingContainer, SettingDivider, SettingRow, SettingRowTitle, SettingTitle } from '..'
import WebDavSettings from './WebDavSettings'

const GeneralSettings: FC = () => {
  const {
    language,
    proxyUrl: storeProxyUrl,
    theme,
    windowStyle,
    topicPosition,
    clickAssistantToShowTopic,
    manualUpdateCheck,
    setTheme,
    setWindowStyle,
    setTopicPosition
  } = useSettings()
  const [proxyUrl, setProxyUrl] = useState<string | undefined>(storeProxyUrl)

  const dispatch = useAppDispatch()
  const { t } = useTranslation()

  const onSelectLanguage = (value: string) => {
    dispatch(setLanguage(value))
    localStorage.setItem('language', value)
    i18n.changeLanguage(value)
  }

  const onSetProxyUrl = () => {
    if (proxyUrl && !isValidProxyUrl(proxyUrl)) {
      window.message.error({ content: t('message.error.invalid.proxy.url'), key: 'proxy-error' })
      return
    }

    dispatch(_setProxyUrl(proxyUrl))
    window.api.setProxy(proxyUrl)
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          <SettingContainer>
            <SettingTitle>{t('settings.general.title')}</SettingTitle>
            <SettingDivider />
            <SettingRow>
              <SettingRowTitle>{t('common.language')}</SettingRowTitle>
              <Select
                defaultValue={language || 'en-US'}
                style={{ width: 180 }}
                onChange={onSelectLanguage}
                options={[
                  { value: 'zh-CN', label: '中文' },
                  { value: 'zh-TW', label: '中文（繁体）' },
                  { value: 'en-US', label: 'English' }
                ]}
              />
            </SettingRow>
            <SettingDivider />
            <SettingRow>
              <SettingRowTitle>{t('settings.theme.title')}</SettingRowTitle>
              <Select
                defaultValue={theme}
                style={{ width: 180 }}
                onChange={setTheme}
                options={[
                  { value: ThemeMode.light, label: t('settings.theme.light') },
                  { value: ThemeMode.dark, label: t('settings.theme.dark') },
                  { value: ThemeMode.auto, label: t('settings.theme.auto') }
                ]}
              />
            </SettingRow>
            {isMac && (
              <>
                <SettingDivider />
                <SettingRow>
                  <SettingRowTitle>{t('settings.theme.window.style.title')}</SettingRowTitle>
                  <Select
                    defaultValue={windowStyle || 'opaque'}
                    style={{ width: 180 }}
                    onChange={setWindowStyle}
                    options={[
                      { value: 'transparent', label: t('settings.theme.window.style.transparent') },
                      { value: 'opaque', label: t('settings.theme.window.style.opaque') }
                    ]}
                  />
                </SettingRow>
              </>
            )}
            <SettingDivider />
            <SettingRow>
              <SettingRowTitle>{t('settings.topic.position')}</SettingRowTitle>
              <Select
                defaultValue={topicPosition || 'right'}
                style={{ width: 180 }}
                onChange={setTopicPosition}
                options={[
                  { value: 'left', label: t('settings.topic.position.left') },
                  { value: 'right', label: t('settings.topic.position.right') }
                ]}
              />
            </SettingRow>
            <SettingDivider />
            {topicPosition === 'left' && (
              <>
                <SettingRow style={{ minHeight: 32 }}>
                  <SettingRowTitle>{t('settings.advanced.click_assistant_switch_to_topics')}</SettingRowTitle>
                  <Switch
                    checked={clickAssistantToShowTopic}
                    onChange={(checked) => dispatch(setClickAssistantToShowTopic(checked))}
                  />
                </SettingRow>
                <SettingDivider />
              </>
            )}
            <SettingRow>
              <SettingRowTitle>{t('settings.general.check_update_setting')}</SettingRowTitle>
              <Select
                defaultValue={manualUpdateCheck ?? false}
                style={{ width: 180 }}
                onChange={(v) => dispatch(setManualUpdateCheck(v))}
                options={[
                  { value: false, label: t('settings.general.auto_update_check') },
                  { value: true, label: t('settings.general.manual_update_check') }
                ]}
              />
            </SettingRow>
            <SettingDivider />
            <SettingRow>
              <SettingRowTitle>{t('settings.proxy.title')}</SettingRowTitle>
              <Input
                placeholder="socks5://127.0.0.1:6153"
                value={proxyUrl}
                onChange={(e) => setProxyUrl(e.target.value)}
                style={{ width: 180 }}
                onBlur={() => onSetProxyUrl()}
                type="url"
              />
            </SettingRow>
            <SettingDivider />
            <SettingRow style={{ minHeight: 32 }}>
              <SettingRowTitle>{t('settings.general.webdav.title')}</SettingRowTitle>
              <VStack gap="5px">
                <Link to="/settings/general/webdav" style={{ color: 'var(--color-text-2)' }}>
                  {t('settings.general.view_webdav_settings')}
                </Link>
              </VStack>
            </SettingRow>
            <SettingDivider />
            <SettingRow>
              <SettingRowTitle>{t('settings.general.backup.title')}</SettingRowTitle>
              <HStack gap="5px" justifyContent="space-between">
                <Button onClick={backup} icon={<SaveOutlined />}>
                  {t('settings.general.backup.button')}
                </Button>
                <Button onClick={restore} icon={<FolderOpenOutlined />}>
                  {t('settings.general.restore.button')}
                </Button>
              </HStack>
            </SettingRow>
            <SettingDivider />
            <SettingRow>
              <SettingRowTitle>{t('settings.general.reset.title')}</SettingRowTitle>
              <HStack gap="5px">
                <Button onClick={reset} danger>
                  {t('settings.general.reset.button')}
                </Button>
              </HStack>
            </SettingRow>
            <SettingDivider />
          </SettingContainer>
        }
      />
      <Route path="webdav" element={<WebDavSettings />} />
    </Routes>
  )
}

export default GeneralSettings
