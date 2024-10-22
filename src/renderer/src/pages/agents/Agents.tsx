import { DeleteOutlined, EditOutlined, MoreOutlined, PlusOutlined } from '@ant-design/icons'
import AssistantSettingsPopup from '@renderer/components/AssistantSettings'
import DragableList from '@renderer/components/DragableList'
import { HStack } from '@renderer/components/Layout'
import { useAgents } from '@renderer/hooks/useAgents'
import { createAssistantFromAgent } from '@renderer/services/assistant'
import { Agent } from '@renderer/types'
import { Button, Dropdown } from 'antd'
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
    </Container>
  )
}

const Container = styled.div`
  padding: 15px;
  display: flex;
  flex-direction: column;
  width: 280px;
  height: calc(100vh - var(--navbar-height));
  border-right: 0.5px solid var(--color-border);
  overflow-y: scroll;
`

const AgentItem = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 12px;
  min-height: 38px;
  border-radius: 10px;
  user-select: none;
  margin-bottom: 12px;
  padding-bottom: 12px;
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
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: -5px;
  color: var(--color-text-3);
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
