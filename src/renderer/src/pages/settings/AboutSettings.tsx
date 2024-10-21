import { GithubOutlined } from '@ant-design/icons'
import { FileProtectOutlined, GlobalOutlined, MailOutlined, SoundOutlined } from '@ant-design/icons'
import { HStack } from '@renderer/components/Layout'
import MinApp from '@renderer/components/MinApp'
import { APP_NAME, AppLogo } from '@renderer/config/env'
import { useSettings } from '@renderer/hooks/useSettings'
import { useAppDispatch } from '@renderer/store'
import { setManualUpdateCheck } from '@renderer/store/settings'
import { runAsyncFunction } from '@renderer/utils'
import { Avatar, Button, Progress, Row, Switch, Tag } from 'antd'
import { ProgressInfo } from 'electron-updater'
import { debounce } from 'lodash'
import { FC, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import styled from 'styled-components'

import { SettingContainer, SettingDivider, SettingRow, SettingTitle } from '.'

const AboutSettings: FC = () => {
  const [version, setVersion] = useState('')
  const { t } = useTranslation()
  const [percent, setPercent] = useState(0)
  const [checkUpdateLoading, setCheckUpdateLoading] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const { manualUpdateCheck } = useSettings()
  const dispatch = useAppDispatch()

  const onCheckUpdate = debounce(
    async () => {
      if (checkUpdateLoading || downloading) return
      setCheckUpdateLoading(true)

      try {
        await window.api.checkForUpdate()
      } catch (error) {
        window.message.error(t('settings.about.updateError'))
      }

      setCheckUpdateLoading(false)
    },
    2000,
    { leading: true, trailing: false }
  )

  const onOpenWebsite = (url: string) => {
    window.api.openWebsite(url)
  }

  const mailto = async () => {
    const email = 'kangfenmao@qq.com'
    const subject = `${APP_NAME} Feedback`
    const version = (await window.api.getAppInfo()).version
    const platform = window.electron.process.platform
    const url = `mailto:${email}?subject=${subject}&body=%0A%0AVersion: ${version} | Platform: ${platform}`
    onOpenWebsite(url)
  }

  const showLicense = async () => {
    const { appPath } = await window.api.getAppInfo()
    MinApp.start({
      name: t('settings.about.license.title'),
      url: `file://${appPath}/resources/cherry-studio/license.html`,
      logo: AppLogo
    })
  }

  useEffect(() => {
    runAsyncFunction(async () => {
      const appInfo = await window.api.getAppInfo()
      setVersion(appInfo.version)
    })
  }, [])

  useEffect(() => {
    const ipcRenderer = window.electron.ipcRenderer
    const removers = [
      ipcRenderer.on('update-not-available', () => {
        setCheckUpdateLoading(false)
        window.message.success(t('settings.about.updateNotAvailable'))
      }),
      ipcRenderer.on('update-available', () => {
        setCheckUpdateLoading(false)
      }),
      ipcRenderer.on('download-update', () => {
        setCheckUpdateLoading(false)
        setDownloading(true)
      }),
      ipcRenderer.on('download-progress', (_, progress: ProgressInfo) => {
        setPercent(progress.percent)
      }),
      ipcRenderer.on('update-error', (_, error) => {
        setCheckUpdateLoading(false)
        setDownloading(false)
        setPercent(0)
        window.modal.info({
          title: t('settings.about.updateError'),
          content: error?.message || t('settings.about.updateError'),
          icon: null
        })
      })
    ]
    return () => removers.forEach((remover) => remover())
  }, [t])

  return (
    <SettingContainer>
      <SettingTitle>
        {t('settings.about.title')}
        <HStack alignItems="center">
          <Link to="https://github.com/kangfenmao/cherry-studio">
            <GithubOutlined style={{ marginRight: 4, color: 'var(--color-text)', fontSize: 20 }} />
          </Link>
        </HStack>
      </SettingTitle>
      <SettingDivider />
      <AboutHeader>
        <Row align="middle">
          <AvatarWrapper onClick={() => onOpenWebsite('https://github.com/kangfenmao/cherry-studio')}>
            {percent > 0 && (
              <ProgressCircle
                type="circle"
                size={84}
                percent={percent}
                showInfo={false}
                strokeLinecap="butt"
                strokeColor="#67ad5b"
              />
            )}
            <Avatar src={AppLogo} size={80} style={{ minHeight: 80 }} />
          </AvatarWrapper>
          <VersionWrapper>
            <Title>{APP_NAME}</Title>
            <Description>{t('settings.about.description')}</Description>
            <Tag
              onClick={() => onOpenWebsite('https://github.com/kangfenmao/cherry-studio/releases')}
              color="cyan"
              style={{ marginTop: 8, cursor: 'pointer' }}>
              v{version}
            </Tag>
          </VersionWrapper>
        </Row>
        <CheckUpdateButton onClick={onCheckUpdate} loading={checkUpdateLoading}>
          {downloading ? t('settings.about.downloading') : t('settings.about.checkUpdate')}
        </CheckUpdateButton>
      </AboutHeader>
      <SettingDivider />
      <SettingRow>
        <SettingRowTitle>{t('settings.general.manually_check_update.title')}</SettingRowTitle>
        <Switch value={manualUpdateCheck} onChange={(v) => dispatch(setManualUpdateCheck(v))} />
      </SettingRow>
      <SettingDivider />
      <SettingRow>
        <SettingRowTitle>
          <SoundOutlined />
          {t('settings.about.releases.title')}
        </SettingRowTitle>
        <Button
          onClick={() =>
            MinApp.start({
              name: t('settings.about.releases.title'),
              url: 'https://github.com/kangfenmao/cherry-studio/releases',
              logo: AppLogo
            })
          }>
          {t('settings.about.releases.button')}
        </Button>
      </SettingRow>
      <SettingDivider />
      <SettingRow>
        <SettingRowTitle>
          <GlobalOutlined />
          {t('settings.about.website.title')}
        </SettingRowTitle>
        <Button onClick={() => onOpenWebsite('https://cherry-ai.com')}>{t('settings.about.website.button')}</Button>
      </SettingRow>
      <SettingDivider />
      <SettingRow>
        <SettingRowTitle>
          <GithubOutlined />
          {t('settings.about.feedback.title')}
        </SettingRowTitle>
        <Button onClick={() => onOpenWebsite('https://github.com/kangfenmao/cherry-studio/issues/new')}>
          {t('settings.about.feedback.button')}
        </Button>
      </SettingRow>
      <SettingDivider />
      <SettingRow>
        <SettingRowTitle>
          <FileProtectOutlined />
          {t('settings.about.license.title')}
        </SettingRowTitle>
        <Button onClick={showLicense}>{t('settings.about.license.button')}</Button>
      </SettingRow>
      <SettingDivider />
      <SettingRow>
        <SettingRowTitle>
          <MailOutlined /> {t('settings.about.contact.title')}
        </SettingRowTitle>
        <Button onClick={mailto}>{t('settings.about.contact.button')}</Button>
      </SettingRow>
      <SettingDivider />
    </SettingContainer>
  )
}

const AboutHeader = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 5px 0;
`

const VersionWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 80px;
  justify-content: center;
  align-items: flex-start;
`

const Title = styled.div`
  font-size: 20px;
  font-weight: bold;
  color: var(--color-text-1);
  margin-bottom: 5px;
`

const Description = styled.div`
  font-size: 14px;
  color: var(--color-text-2);
  text-align: center;
`

const CheckUpdateButton = styled(Button)``

const AvatarWrapper = styled.div`
  position: relative;
  cursor: pointer;
  margin-right: 15px;
`

const ProgressCircle = styled(Progress)`
  position: absolute;
  top: -2px;
  left: -2px;
`

export const SettingRowTitle = styled.div`
  font-size: 14px;
  line-height: 18px;
  color: var(--color-text-1);
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
  .anticon {
    font-size: 16px;
    color: var(--color-text-1);
  }
`

export default AboutSettings
