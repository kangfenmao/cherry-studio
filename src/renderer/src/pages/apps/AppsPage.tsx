import AiAssistantAppLogo from '@renderer/assets/images/apps/360-ai.png'
import BaiduAiAppLogo from '@renderer/assets/images/apps/baidu-ai.png'
import { Navbar, NavbarCenter } from '@renderer/components/app/Navbar'
import { PROVIDER_CONFIG } from '@renderer/config/provider'
import { MinAppType } from '@renderer/types'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import App from './App'

const _apps: MinAppType[] = [
  {
    name: 'AI 助手',
    logo: AiAssistantAppLogo,
    url: 'https://bot.360.com/'
  },
  {
    name: '文心一言',
    logo: BaiduAiAppLogo,
    url: 'https://yiyan.baidu.com/'
  }
]

const AppsPage: FC = () => {
  const { t } = useTranslation()

  const apps: MinAppType[] = (Object.entries(PROVIDER_CONFIG) as any[])
    .filter(([, config]) => config.app)
    .map(([key, config]) => ({ id: key, ...config.app }))
    .concat(_apps)

  return (
    <Container>
      <Navbar>
        <NavbarCenter style={{ borderRight: 'none' }}>{t('agents.title')}</NavbarCenter>
      </Navbar>
      <ContentContainer>
        <AppsContainer>
          {apps.map((app) => (
            <App key={app.name} app={app} />
          ))}
        </AppsContainer>
      </ContentContainer>
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  height: 100%;
`

const ContentContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: row;
  justify-content: center;
  height: 100%;
  overflow-y: scroll;
  background-color: var(--color-background);
  padding: 50px;
`

const AppsContainer = styled.div`
  display: flex;
  min-width: 900px;
  max-width: 900px;
  flex-direction: row;
  flex-wrap: wrap;
  align-content: flex-start;
  gap: 50px;
`

export default AppsPage
