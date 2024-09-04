import { FolderOpenOutlined, SaveOutlined } from '@ant-design/icons'
import { HStack } from '@renderer/components/Layout'
import { useSettings } from '@renderer/hooks/useSettings'
import i18n from '@renderer/i18n'
import { backup, reset, restore } from '@renderer/services/backup'
import { useAppDispatch } from '@renderer/store'
import { setLanguage, setUserName, ThemeMode } from '@renderer/store/settings'
import { setProxyUrl as _setProxyUrl } from '@renderer/store/settings'
import { isValidProxyUrl } from '@renderer/utils'
import { Button, Input, Select } from 'antd'
import { FC, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { SettingContainer, SettingDivider, SettingRow, SettingRowTitle, SettingTitle } from '.'

const GeneralSettings: FC = () => {
  const { language, proxyUrl: storeProxyUrl, userName, theme, windowStyle, setTheme, setWindowStyle } = useSettings()
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
      <SettingDivider />
      <SettingRow>
        <SettingRowTitle>{t('settings.general.user_name')}</SettingRowTitle>
        <Input
          placeholder={t('settings.general.user_name.placeholder')}
          value={userName}
          onChange={(e) => dispatch(setUserName(e.target.value))}
          style={{ width: 180 }}
          maxLength={30}
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
  )
}

export default GeneralSettings
