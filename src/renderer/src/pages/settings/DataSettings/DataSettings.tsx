import { FolderOpenOutlined, SaveOutlined } from '@ant-design/icons'
import { HStack, VStack } from '@renderer/components/Layout'
import { backup, reset, restore } from '@renderer/services/backup'
import { Button } from 'antd'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, Route, Routes } from 'react-router-dom'

import { SettingContainer, SettingDivider, SettingRow, SettingRowTitle, SettingTitle } from '..'
import WebDavSettings from './WebDavSettings'

const DataSettings: FC = () => {
  const { t } = useTranslation()

  return (
    <Routes>
      <Route
        path="/"
        element={
          <SettingContainer>
            <SettingTitle>{t('settings.data')}</SettingTitle>
            <SettingDivider />
            <SettingRow style={{ minHeight: 32 }}>
              <SettingRowTitle>{t('settings.data.webdav.title')}</SettingRowTitle>
              <VStack gap="5px">
                <Link to="/settings/data/webdav" style={{ color: 'var(--color-text-2)' }}>
                  <Button>{t('settings.general.view_webdav_settings')}</Button>
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

export default DataSettings
