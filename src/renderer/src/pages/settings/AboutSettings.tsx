import { Avatar, Button, Progress } from 'antd'
import { FC, useEffect, useState } from 'react'
import styled from 'styled-components'
import Logo from '@renderer/assets/images/logo.png'
import { runAsyncFunction } from '@renderer/utils'
import { useTranslation } from 'react-i18next'
import Changelog from './components/Changelog'
import { debounce } from 'lodash'
import { ProgressInfo } from 'electron-updater'

const AboutSettings: FC = () => {
  const [version, setVersion] = useState('')
  const { t } = useTranslation()
  const [percent, setPercent] = useState(0)
  const [checkUpdateLoading, setCheckUpdateLoading] = useState(false)
  const [downloading, setDownloading] = useState(false)

  const onCheckUpdate = debounce(
    async () => {
      if (checkUpdateLoading || downloading) return
      setCheckUpdateLoading(true)
      await window.api.checkForUpdate()
      setCheckUpdateLoading(false)
    },
    2000,
    { leading: true, trailing: false }
  )

  const onOpenWebsite = (suffix = '') => {
    window.api.openWebsite('https://github.com/kangfenmao/cherry-studio' + suffix)
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
    <Container>
      <AvatarWrapper onClick={() => onOpenWebsite()}>
        {percent > 0 && (
          <ProgressCircle
            type="circle"
            size={104}
            percent={percent}
            showInfo={false}
            strokeLinecap="butt"
            strokeColor="#67ad5b"
          />
        )}
        <Avatar src={Logo} size={100} style={{ marginTop: 50, minHeight: 100 }} />
      </AvatarWrapper>
      <Title>
        Cherry Studio <Version onClick={() => onOpenWebsite('/releases')}>(v{version})</Version>
      </Title>
      <Description>{t('settings.about.description')}</Description>
      <CheckUpdateButton onClick={onCheckUpdate} loading={checkUpdateLoading}>
        {downloading ? t('settings.about.downloading') : t('settings.about.checkUpdate')}
      </CheckUpdateButton>
      <Changelog />
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  height: calc(100vh - var(--navbar-height));
  overflow-y: scroll;
  padding: 0;
  padding-bottom: 50px;
`

const Title = styled.div`
  font-size: 20px;
  font-weight: bold;
  color: var(--color-text-1);
  margin: 10px 0;
`

const Version = styled.span`
  font-size: 14px;
  color: var(--color-text-2);
  margin: 10px 0;
  text-align: center;
  cursor: pointer;
`

const Description = styled.div`
  font-size: 14px;
  color: var(--color-text-2);
  text-align: center;
`

const CheckUpdateButton = styled(Button)`
  margin-top: 10px;
`

const AvatarWrapper = styled.div`
  position: relative;
  cursor: pointer;
`

const ProgressCircle = styled(Progress)`
  position: absolute;
  top: 48px;
  left: -2px;
`

export default AboutSettings
