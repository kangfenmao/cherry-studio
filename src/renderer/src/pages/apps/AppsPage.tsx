import { SearchOutlined } from '@ant-design/icons'
import { Navbar, NavbarCenter } from '@renderer/components/app/Navbar'
import { Center } from '@renderer/components/Layout'
import { getAllMinApps } from '@renderer/config/minapp'
import { Empty, Input } from 'antd'
import { isEmpty } from 'lodash'
import { FC, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import App from './App'

const list = getAllMinApps()

const AppsPage: FC = () => {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')

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
