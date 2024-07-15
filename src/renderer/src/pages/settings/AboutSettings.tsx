import { Avatar } from 'antd'
import { FC, useEffect, useState } from 'react'
import styled from 'styled-components'
import Logo from '@renderer/assets/images/logo.png'
import { runAsyncFunction } from '@renderer/utils'
import { useTranslation } from 'react-i18next'
import Markdown from 'react-markdown'
import changelogs from '@renderer/CHANGELOG.md?raw'

const AboutSettings: FC = () => {
  const [version, setVersion] = useState('')
  const { t } = useTranslation()

  useEffect(() => {
    runAsyncFunction(async () => {
      const appInfo = await window.api.getAppInfo()
      setVersion(appInfo.version)
    })
  }, [])

  return (
    <Container>
      <Avatar src={Logo} size={100} style={{ marginTop: 50 }} />
      <Title>
        Cherry Studio <Version>(v{version})</Version>
      </Title>
      <Description>{t('settings.about.description')}</Description>
      <ChangeLog>
        <Markdown className="markdown">{changelogs}</Markdown>
      </ChangeLog>
    </Container>
  )
}

const Container = styled.div`
  padding: 20px;
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: center;
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
`

const Description = styled.div`
  font-size: 14px;
  color: var(--color-text-2);
  text-align: center;
`

const ChangeLog = styled.div`
  font-size: 14px;
  color: var(--color-text-2);
  background-color: var(--color-background-soft);
  margin-top: 40px;
  padding: 20px;
  border-radius: 5px;
  width: 800px;
`

export default AboutSettings
