import { CodeOutlined, DeleteOutlined, ExportOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons'
import { nanoid } from '@reduxjs/toolkit'
import { NavbarRight } from '@renderer/components/app/Navbar'
import DragableList from '@renderer/components/DragableList'
import IndicatorLight from '@renderer/components/IndicatorLight'
import { HStack } from '@renderer/components/Layout'
import ListItem from '@renderer/components/ListItem'
import Scrollbar from '@renderer/components/Scrollbar'
import { useMCPServers } from '@renderer/hooks/useMCPServers'
import { EventEmitter } from '@renderer/services/EventService'
import { MCPServer } from '@renderer/types'
import { Button, Dropdown, MenuProps } from 'antd'
import { isEmpty } from 'lodash'
import { FC, useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { SettingContainer } from '..'
import McpSettings from './McpSettings'
import NpxSearch from './NpxSearch'

const MCPSettings: FC = () => {
  const { t } = useTranslation()
  const { mcpServers, addMCPServer, updateMcpServers, deleteMCPServer } = useMCPServers()
  const [selectedMcpServer, setSelectedMcpServer] = useState<MCPServer | null>(mcpServers[0])
  const [isNpxSearch, setIsNpxSearch] = useState(false)

  useEffect(() => {
    const unsub = EventEmitter.on('open-npx-search', () => setIsNpxSearch(true))
    return () => unsub()
  }, [])

  const onAddMcpServer = async () => {
    const newServer = {
      id: nanoid(),
      name: t('settings.mcp.newServer'),
      description: '',
      baseUrl: '',
      command: '',
      args: [],
      env: {},
      isActive: false
    }
    addMCPServer(newServer)
    window.message.success({ content: t('settings.mcp.addSuccess'), key: 'mcp-list' })
    setSelectedMcpServer(newServer)
  }

  const onDeleteMcpServer = useCallback(
    async (server: MCPServer) => {
      try {
        await window.api.mcp.removeServer(server)
        await deleteMCPServer(server.id)
        window.message.success({ content: t('settings.mcp.deleteSuccess'), key: 'mcp-list' })
      } catch (error: any) {
        window.message.error({
          content: `${t('settings.mcp.deleteError')}: ${error.message}`,
          key: 'mcp-list'
        })
      }
    },
    [deleteMCPServer, t]
  )

  const getMenuItems = useCallback(
    (server: MCPServer) => {
      const menus: MenuProps['items'] = [
        {
          label: t('common.delete'),
          danger: true,
          key: 'delete',
          icon: <DeleteOutlined />,
          onClick: () => onDeleteMcpServer(server)
        }
      ]
      return menus
    },
    [onDeleteMcpServer, t]
  )

  useEffect(() => {
    const _selectedMcpServer = mcpServers.find((server) => server.id === selectedMcpServer?.id)
    setSelectedMcpServer(_selectedMcpServer || mcpServers[0])
  }, [mcpServers, selectedMcpServer])

  return (
    <Container>
      <McpList>
        <ListItem
          key="add"
          title={t('settings.mcp.addServer')}
          active={false}
          onClick={onAddMcpServer}
          icon={<PlusOutlined />}
          titleStyle={{ fontWeight: 500 }}
          style={{ marginBottom: 5 }}
        />
        <DragableList list={mcpServers} onUpdate={updateMcpServers}>
          {(server: MCPServer) => (
            <Dropdown menu={{ items: getMenuItems(server) }} trigger={['contextMenu']} key={server.id}>
              <div>
                <ListItem
                  key={server.id}
                  title={server.name}
                  active={selectedMcpServer?.id === server.id}
                  onClick={() => {
                    setSelectedMcpServer(server)
                    setIsNpxSearch(false)
                  }}
                  titleStyle={{ fontWeight: 500 }}
                  icon={<CodeOutlined />}
                  rightContent={
                    <IndicatorLight
                      size={6}
                      color={server.isActive ? 'green' : 'var(--color-text-3)'}
                      animation={server.isActive}
                      shadow={false}
                      style={{ marginRight: 4 }}
                    />
                  }
                />
              </div>
            </Dropdown>
          )}
        </DragableList>
      </McpList>

      {isNpxSearch || isEmpty(mcpServers) ? (
        <SettingContainer>
          <NpxSearch />
        </SettingContainer>
      ) : (
        selectedMcpServer && <McpSettings server={selectedMcpServer} />
      )}
    </Container>
  )
}

export const McpSettingsNavbar = () => {
  const { t } = useTranslation()
  const onClick = () => window.open('https://mcp.so/', '_blank')

  return (
    <NavbarRight>
      <HStack alignItems="center" gap={5}>
        <Button
          size="small"
          type="text"
          onClick={() => EventEmitter.emit('open-npx-search')}
          icon={<SearchOutlined />}
          className="nodrag"
          style={{ fontSize: 14 }}>
          {t('settings.mcp.searchNpx')}
        </Button>
        <Button
          size="small"
          type="text"
          onClick={onClick}
          icon={<ExportOutlined />}
          className="nodrag"
          style={{ fontSize: 14 }}>
          {t('settings.mcp.findMore')}
        </Button>
      </HStack>
    </NavbarRight>
  )
}

const Container = styled(HStack)`
  flex: 1;
`

const McpList = styled(Scrollbar)`
  display: flex;
  flex-direction: column;
  gap: 5px;
  width: var(--settings-width);
  padding: 12px;
  border-right: 0.5px solid var(--color-border);
  height: calc(100vh - var(--navbar-height));
  .iconfont {
    color: var(--color-text-2);
    line-height: 16px;
  }
`

export default MCPSettings
