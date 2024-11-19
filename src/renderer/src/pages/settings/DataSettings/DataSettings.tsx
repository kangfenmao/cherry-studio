import { FileSearchOutlined, FolderOpenOutlined, SaveOutlined } from '@ant-design/icons'
import { HStack, VStack } from '@renderer/components/Layout'
import { backup, reset, restore } from '@renderer/services/BackupService'
import { AppInfo } from '@renderer/types'
import { Button, Typography } from 'antd'
import { FC, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import styled from 'styled-components'

import { SettingContainer, SettingDivider, SettingGroup, SettingRow, SettingRowTitle, SettingTitle } from '..'
import WebDavSettings from './WebDavSettings'

const DataSettings: FC = () => {
  const { t } = useTranslation()
  const [appInfo, setAppInfo] = useState<AppInfo>()

  useEffect(() => {
    window.api.getAppInfo().then(setAppInfo)
  }, [])

  const handleOpenPath = (path: string) => {
    if (path?.endsWith('log')) {
      const dirPath = path.split(/[/\\]/).slice(0, -1).join('/')
      window.api.openPath(dirPath)
    } else {
      window.api.openPath(path)
    }
  }

  return (
    <SettingContainer>
      <SettingGroup>
        <SettingTitle>{t('settings.data')}</SettingTitle>
        <SettingDivider />
        <SettingRow>
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
      </SettingGroup>
      <SettingGroup>
        <WebDavSettings />
      </SettingGroup>
      <SettingGroup>
        <SettingTitle>{t('settings.data.title')}</SettingTitle>
        <SettingDivider />
        <SettingRow>
          <SettingRowTitle>{t('settings.data.app_data')}</SettingRowTitle>
          <HStack alignItems="center" gap="5px">
            <Typography.Text style={{ color: 'var(--color-text-3)' }}>{appInfo?.appDataPath}</Typography.Text>
            <StyledIcon onClick={() => handleOpenPath(appInfo?.appDataPath)} />
          </HStack>
        </SettingRow>
        <SettingDivider />
        <SettingRow>
          <SettingRowTitle>{t('settings.data.app_logs')}</SettingRowTitle>
          <HStack alignItems="center" gap="5px">
            <Typography.Text style={{ color: 'var(--color-text-3)' }}>{appInfo?.logsPath}</Typography.Text>
            <StyledIcon onClick={() => handleOpenPath(appInfo?.logsPath)} />
          </HStack>
        </SettingRow>
      </SettingGroup>
    </SettingContainer>
  )
}

const StyledIcon = styled(FileSearchOutlined)`
  color: var(--color-text-2);
  cursor: pointer;
  transition: color 0.3s;

  &:hover {
    color: var(--color-text-1);
  }
`

export default DataSettings
