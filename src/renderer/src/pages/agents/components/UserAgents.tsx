import { PlusOutlined } from '@ant-design/icons'
import { useAgents } from '@renderer/hooks/useAgents'
import { Agent } from '@renderer/types'
import { Col, Row } from 'antd'
import { FC } from 'react'
import styled from 'styled-components'

import AddAssistantPopup from './AddAgentPopup'
import AgentCard from './AgentCard'

interface Props {
  onAdd: (agent: Agent) => void
}

const UserAgents: FC<Props> = ({ onAdd }) => {
  const { agents } = useAgents()

  const onAddMyAgentClick = () => {
    AddAssistantPopup.show()
  }

  return (
    <Row gutter={16} style={{ marginBottom: 16 }}>
      {agents.map((agent) => (
        <Col span={8} key={agent.id}>
          <AgentCard agent={agent} onClick={() => onAdd(agent)} />
        </Col>
      ))}
      <Col span={8}>
        <AssistantCardContainer style={{ borderStyle: 'dashed' }} onClick={onAddMyAgentClick}>
          <PlusOutlined />
        </AssistantCardContainer>
      </Col>
    </Row>
  )
}

const AssistantCardContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  border: 1px dashed var(--color-border-soft);
  border-radius: 10px;
  cursor: pointer;
  min-height: 72px;
  .anticon {
    font-size: 16px;
    color: var(--color-icon);
  }
  &:hover {
    background-color: var(--color-background-soft);
  }
`

export default UserAgents
