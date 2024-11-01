import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons'
import AssistantSettingsPopup from '@renderer/components/AssistantSettings'
import { useAgents } from '@renderer/hooks/useAgents'
import { createAssistantFromAgent } from '@renderer/services/AssistantService'
import { Agent } from '@renderer/types'
import { Col } from 'antd'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import AgentCard from './components/AgentCard'

interface Props {
  onClick?: (agent: Agent) => void
}

const Agents: React.FC<Props> = ({ onClick }) => {
  const { t } = useTranslation()
  const { agents, removeAgent } = useAgents()

  const handleDelete = useCallback(
    (agent: Agent) => {
      window.modal.confirm({
        centered: true,
        content: t('agents.delete.popup.content'),
        onOk: () => removeAgent(agent.id)
      })
    },
    [removeAgent, t]
  )

  return (
    <>
      {agents.map((agent) => {
        const dropdownMenuItems = [
          {
            key: 'edit',
            label: t('agents.edit.title'),
            icon: <EditOutlined />,
            onClick: () => AssistantSettingsPopup.show({ assistant: agent })
          },
          {
            key: 'create',
            label: t('agents.add.button'),
            icon: <PlusOutlined />,
            onClick: () => createAssistantFromAgent(agent)
          },
          {
            key: 'delete',
            label: t('common.delete'),
            icon: <DeleteOutlined />,
            danger: true,
            onClick: () => handleDelete(agent)
          }
        ]

        const contextMenuItems = [
          {
            label: t('agents.edit.title'),
            onClick: () => AssistantSettingsPopup.show({ assistant: agent })
          },
          {
            label: t('agents.add.button'),
            onClick: () => createAssistantFromAgent(agent)
          },
          {
            label: t('common.delete'),
            onClick: () => handleDelete(agent)
          }
        ]

        return (
          <Col span={6} key={agent.id}>
            <AgentCard
              agent={agent}
              onClick={() => onClick?.(agent)}
              contextMenu={contextMenuItems}
              menuItems={dropdownMenuItems}
            />
          </Col>
        )
      })}
    </>
  )
}

const Container = styled.div`
  padding: 10px 15px;
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - var(--navbar-height));
  min-width: var(--assistants-width);
  max-width: var(--assistants-width);
  overflow-y: auto;
  overflow-x: hidden;

  &::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  &::-webkit-scrollbar-track {
    border-radius: 3px;
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    border-radius: 3px;
    background: var(--color-scrollbar-thumb);
    transition: all 0.2s ease-in-out;
  }

  &:hover::-webkit-scrollbar-thumb {
    background: var(--color-scrollbar-thumb);
  }
`

export default Agents
