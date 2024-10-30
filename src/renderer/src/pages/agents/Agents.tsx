import { DeleteOutlined, EditOutlined, MoreOutlined, PlusOutlined } from '@ant-design/icons'
import AssistantSettingsPopup from '@renderer/components/AssistantSettings'
import DragableList from '@renderer/components/DragableList'
import { HStack } from '@renderer/components/Layout'
import Scrollbar from '@renderer/components/Scrollbar'
import { useAgents } from '@renderer/hooks/useAgents'
import { createAssistantFromAgent } from '@renderer/services/AssistantService'
import { Agent } from '@renderer/types'
import { Button, Dropdown, Typography } from 'antd'
import { ItemType } from 'antd/es/menu/interface'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import AddAgentPopup from './components/AddAgentPopup'

interface Props {
  onClick: (agent: Agent) => void
}

const Agents: React.FC<Props> = ({ onClick }) => {
  const { t } = useTranslation()
  const { agents, removeAgent, updateAgents } = useAgents()
  const [dragging, setDragging] = useState(false)

  const getMenuItems = useCallback(
    (agent: Agent) =>
      [
        {
          label: t('agents.edit.title'),
          key: 'edit',
          icon: <EditOutlined />,
          onClick: () => AssistantSettingsPopup.show({ assistant: agent })
        },
        {
          label: t('agents.add.button'),
          key: 'create',
          icon: <PlusOutlined />,
          onClick: () => createAssistantFromAgent(agent)
        },
        { type: 'divider' },
        {
          label: t('common.delete'),
          key: 'delete',
          icon: <DeleteOutlined />,
          danger: true,
          onClick: () => {
            window.modal.confirm({
              centered: true,
              content: t('agents.delete.popup.content'),
              onOk: () => removeAgent(agent.id)
            })
          }
        }
      ] as ItemType[],
    [removeAgent, t]
  )

  return (
    <Container style={{ paddingBottom: dragging ? 30 : 0 }}>
      <Typography.Title level={5} style={{ marginBottom: 16 }}>
        {t('agents.my_agents')}
      </Typography.Title>
      {agents.length > 0 && (
        <DragableList
          list={agents}
          onUpdate={updateAgents}
          onDragStart={() => setDragging(true)}
          onDragEnd={() => setDragging(false)}>
          {(agent: Agent) => (
            <Dropdown menu={{ items: getMenuItems(agent) }} trigger={['contextMenu']}>
              <AgentItem onClick={() => onClick(agent)}>
                <HStack alignItems="center" justifyContent="space-between" h="36px">
                  <AgentItemName className="text-nowrap">
                    {agent.emoji} {agent.name}
                  </AgentItemName>
                  <ActionButton className="actions" gap="15px" onClick={(e) => e.stopPropagation()}>
                    <Dropdown menu={{ items: getMenuItems(agent) }} trigger={['hover']}>
                      <MoreOutlined style={{ cursor: 'pointer' }} />
                    </Dropdown>
                  </ActionButton>
                </HStack>
                <AgentItemPrompt>{agent.prompt}</AgentItemPrompt>
              </AgentItem>
            </Dropdown>
          )}
        </DragableList>
      )}
      {!dragging && (
        <Button
          type="dashed"
          icon={<PlusOutlined />}
          onClick={() => AddAgentPopup.show()}
          style={{ borderRadius: 20, height: 34 }}>
          {t('agents.add.title')}
        </Button>
      )}
      <div style={{ height: 10 }} />
    </Container>
  )
}

const Container = styled(Scrollbar)`
  padding: 10px 15px;
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - var(--navbar-height));
  min-width: var(--assistants-width);
  max-width: var(--assistants-width);
`

const AgentItem = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 12px;
  min-height: 72px;
  border-radius: 10px;
  user-select: none;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border: 0.5px solid var(--color-border);
  transition: all 0.2s ease-in-out;
  cursor: pointer;
  &:hover {
    .actions {
      display: flex;
    }
  }
  &:hover {
    border: 0.5px solid var(--color-primary);
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  }
`

const AgentItemName = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`

const AgentItemPrompt = styled.div`
  font-size: 12px;
  color: var(--color-text-soft);
  margin-top: -5px;
  color: var(--color-text-3);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: normal;
  word-wrap: break-word;
  line-height: 16px;
`

const ActionButton = styled(HStack)`
  align-items: center;
  justify-content: center;
  display: none;
  background-color: var(--color-background-soft);
  width: 24px;
  height: 24px;
  border-radius: 12px;
  font-size: 16px;
  color: var(--color-icon);
`

export default Agents
