import { GlobalOutlined } from '@ant-design/icons'
import OcrIcon from '@renderer/components/Icons/OcrIcon'
import { HStack } from '@renderer/components/Layout'
import ListItem from '@renderer/components/ListItem'
import { FileCode, Server } from 'lucide-react'
import { FC, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import ApiServerSettings from './ApiServerSettings/ApiServerSettings'
import OcrSettings from './OcrSettings'
import PreprocessSettings from './PreprocessSettings'
import WebSearchSettings from './WebSearchSettings'

let _menu: string = 'web-search'

const ToolSettings: FC = () => {
  const { t } = useTranslation()
  const [menu, setMenu] = useState<string>(_menu)
  const menuItems = [
    { key: 'web-search', title: 'settings.tool.websearch.title', icon: <GlobalOutlined style={{ fontSize: 16 }} /> },
    { key: 'preprocess', title: 'settings.tool.preprocess.title', icon: <FileCode size={16} /> },
    { key: 'ocr', title: 'settings.tool.ocr.title', icon: <OcrIcon /> },
    { key: 'api-server', title: 'apiServer.title', icon: <Server size={16} /> }
  ]

  _menu = menu

  return (
    <Container>
      <MenuList>
        {menuItems.map((item) => (
          <ListItem
            key={item.key}
            title={t(item.title)}
            active={menu === item.key}
            onClick={() => setMenu(item.key)}
            titleStyle={{ fontWeight: 500 }}
            icon={item.icon}
          />
        ))}
      </MenuList>
      {menu == 'web-search' && <WebSearchSettings />}
      {menu == 'preprocess' && <PreprocessSettings />}
      {menu == 'ocr' && <OcrSettings />}
      {menu == 'api-server' && <ApiServerSettings />}
    </Container>
  )
}

const Container = styled(HStack)`
  flex: 1;
`
const MenuList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  width: var(--settings-width);
  padding: 12px;
  border-right: 0.5px solid var(--color-border);
  height: 100%;
  .iconfont {
    line-height: 16px;
  }
`
export default ToolSettings
