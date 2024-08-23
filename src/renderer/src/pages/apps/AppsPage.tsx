import { SearchOutlined } from '@ant-design/icons'
import AiAssistantAppLogo from '@renderer/assets/images/apps/360-ai.png'
import AiSearchAppLogo from '@renderer/assets/images/apps/ai-search.png'
import BaiduAiAppLogo from '@renderer/assets/images/apps/baidu-ai.png'
import DevvAppLogo from '@renderer/assets/images/apps/devv.png'
import MetasoAppLogo from '@renderer/assets/images/apps/metaso.webp'
import SensetimeAppLogo from '@renderer/assets/images/apps/sensetime.png'
import SparkDeskAppLogo from '@renderer/assets/images/apps/sparkdesk.png'
import TiangongAiLogo from '@renderer/assets/images/apps/tiangong.png'
import TencentYuanbaoAppLogo from '@renderer/assets/images/apps/yuanbao.png'
import { Navbar, NavbarCenter } from '@renderer/components/app/Navbar'
import { Center } from '@renderer/components/Layout'
import { PROVIDER_CONFIG } from '@renderer/config/provider'
import { MinAppType } from '@renderer/types'
import { Empty, Input } from 'antd'
import { isEmpty } from 'lodash'
import { FC, useState } from 'react'
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
  },
  {
    name: 'SparkDesk',
    logo: SparkDeskAppLogo,
    url: 'https://xinghuo.xfyun.cn/desk'
  },
  {
    name: '腾讯元宝',
    logo: TencentYuanbaoAppLogo,
    url: 'https://yuanbao.tencent.com/chat'
  },
  {
    name: '商量',
    logo: SensetimeAppLogo,
    url: 'https://chat.sensetime.com/wb/chat'
  },
  {
    name: '360AI搜索',
    logo: AiSearchAppLogo,
    url: 'https://so.360.com/'
  },
  {
    name: '秘塔AI搜索',
    logo: MetasoAppLogo,
    url: 'https://metaso.cn/'
  },
  {
    name: '天工AI',
    logo: TiangongAiLogo,
    url: 'https://www.tiangong.cn/'
  },
  {
    name: 'DEVV_',
    logo: DevvAppLogo,
    url: 'https://devv.ai/referral?code=dvl5am34asqo'
  }
]

const AppsPage: FC = () => {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')

  const list: MinAppType[] = (Object.entries(PROVIDER_CONFIG) as any[])
    .filter(([, config]) => config.app)
    .map(([key, config]) => ({ id: key, ...config.app }))
    .concat(_apps)

  const apps = search
    ? list.filter(
        (app) => app.name.toLowerCase().includes(search.toLowerCase()) || app.url.includes(search.toLowerCase())
      )
    : list

  return (
    <Container>
      <Navbar>
        <NavbarCenter style={{ borderRight: 'none', justifyContent: 'space-between' }}>
          {t('minapp.title')}
          <Input
            placeholder={t('common.search')}
            className="nodrag"
            style={{ width: '30%', height: 28 }}
            size="small"
            variant="filled"
            suffix={<SearchOutlined />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div style={{ width: 80 }} />
        </NavbarCenter>
      </Navbar>
      <ContentContainer>
        <AppsContainer>
          {apps.map((app) => (
            <App key={app.name} app={app} />
          ))}
          {isEmpty(apps) && (
            <Center style={{ flex: 1 }}>
              <Empty />
            </Center>
          )}
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
