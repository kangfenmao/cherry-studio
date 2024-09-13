import { SearchOutlined } from '@ant-design/icons'
import { Navbar, NavbarCenter } from '@renderer/components/app/Navbar'
import { Center } from '@renderer/components/Layout'
import { getAllMinApps } from '@renderer/config/minapp'
import { Empty, Input } from 'antd'
import { isEmpty } from 'lodash'
import { FC, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import App from './App'

// 定义应用的类型
interface AppType {
  id: string // 确保 id 是 string 类型
  name: string
  url: string
  logo: string
  sortOrder?: number // 可选属性
}

const AppsPage: FC = () => {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [apps, setApps] = useState<AppType[]>([]) // 使用定义的类型

  useEffect(() => {
    const list = getAllMinApps()
    const processedList: AppType[] = list.map((app, index) => {
      // 为每个应用添加 id 和排序编号
      const id = app.id ? String(app.id) : app.name.toLowerCase() // 确保 id 是字符串
      return {
        ...app,
        id,
        sortOrder: index + 1 // 排序编号从 1 开始
      }
    })

    // 存储到本地存储
    localStorage.setItem('minApps', JSON.stringify(processedList))

    // 更新状态
    setApps(processedList)
  }, [])

  const filteredApps = search
    ? apps.filter(
        (app) => app.name.toLowerCase().includes(search.toLowerCase()) || app.url.includes(search.toLowerCase())
      )
    : apps

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
          {filteredApps.map((app) => (
            <App key={app.id} app={app} />
          ))}
          {isEmpty(filteredApps) && (
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
