import { isMac } from '@renderer/config/constant'
import { Switch, Table as AntTable, Tag } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { SettingContainer, SettingDivider, SettingTitle } from '.'

interface ShortcutItem {
  key: string
  name: string
  shortcut: string
  enabled: boolean
}

const ShortcutSettings: FC = () => {
  const { t } = useTranslation()

  const commandKey = isMac ? '⌘' : 'Ctrl'

  const columns: ColumnsType<ShortcutItem> = [
    {
      title: t('settings.shortcuts.action'),
      dataIndex: 'name',
      key: 'name',
      width: '50%'
    },
    {
      title: t('settings.shortcuts.key'),
      dataIndex: 'shortcut',
      key: 'shortcut',
      width: '30%',
      render: (shortcut: string) => {
        const keys = shortcut.split(' ').map((key) => key.trim())
        return (
          <span>
            {keys.map((key) => (
              <Tag key={key} style={{ padding: '2px 8px', fontSize: '13px' }}>
                <span style={{ fontFamily: 'monospace' }}>{key}</span>
              </Tag>
            ))}
          </span>
        )
      }
    },
    {
      title: '',
      key: 'enabled',
      width: '20%',
      align: 'right',
      render: () => <Switch defaultChecked disabled />
    }
  ]

  const shortcuts: ShortcutItem[] = [
    {
      key: 'new_topic',
      name: t('settings.shortcuts.new_topic'),
      shortcut: `${commandKey} N`,
      enabled: true
    },
    {
      key: 'zoom_in',
      name: t('settings.shortcuts.zoom_in'),
      shortcut: `${commandKey} +`,
      enabled: true
    },
    {
      key: 'zoom_out',
      name: t('settings.shortcuts.zoom_out'),
      shortcut: `${commandKey} -`,
      enabled: true
    },
    {
      key: 'zoom_reset',
      name: t('settings.shortcuts.zoom_reset'),
      shortcut: `${commandKey} 0`,
      enabled: true
    }
  ]

  return (
    <SettingContainer>
      <SettingTitle>{t('settings.shortcuts.title')}</SettingTitle>
      <SettingDivider style={{ marginBottom: 0 }} />
      <Table
        columns={columns as ColumnsType<unknown>}
        dataSource={shortcuts}
        pagination={false}
        size="middle"
        showHeader={false}
      />
    </SettingContainer>
  )
}

const Table = styled(AntTable)`
  .ant-table {
    background: transparent;
  }

  .ant-table-cell {
    padding: 14px 0 !important;
    background: transparent !important;
  }
`

export default ShortcutSettings
