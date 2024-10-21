import { Navbar, NavbarCenter } from '@renderer/components/app/Navbar'
import { VStack } from '@renderer/components/Layout'
import SystemAgents from '@renderer/config/agents.json'
import { createAssistantFromAgent } from '@renderer/services/assistant'
import { Agent } from '@renderer/types'
import { uuid } from '@renderer/utils'
import { Col, Row, Typography } from 'antd'
import { groupBy, omit } from 'lodash'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import ReactMarkdown from 'react-markdown'
import styled from 'styled-components'

import Agents from './Agents'
import AgentCard from './components/AgentCard'

const { Title } = Typography

const AgentsPage: FC = () => {
  const agentGroups = groupBy(SystemAgents, 'group')
  const { t } = useTranslation()

  const getAgentName = (agent: Agent) => {
    return agent.emoji ? agent.emoji + ' ' + agent.name : agent.name
  }

  const onAddAgentConfirm = (agent: Agent) => {
    window.modal.confirm({
      title: getAgentName(agent),
      content: (
        <AgentPrompt>
          <ReactMarkdown className="markdown">{agent.description || agent.prompt}</ReactMarkdown>
        </AgentPrompt>
      ),
      width: 600,
      icon: null,
      closable: true,
      maskClosable: true,
      centered: true,
      okButtonProps: { type: 'primary' },
      okText: t('agents.add.button'),
      onOk: () => createAssistantFromAgent(agent)
    })
  }

  const getAgentFromSystemAgent = (agent: (typeof SystemAgents)[number]) => {
    return {
      ...omit(agent, 'group'),
      name: agent.name,
      id: uuid(),
      topics: [],
      type: 'agent'
    }
  }

  return (
    <Container>
      <Navbar>
        <NavbarCenter style={{ borderRight: 'none' }}>{t('agents.title')}</NavbarCenter>
      </Navbar>
      <ContentContainer id="content-container">
        <Agents onClick={onAddAgentConfirm} />
        <AssistantsContainer>
          <VStack style={{ flex: 1 }}>
            {Object.keys(agentGroups)
              .reverse()
              .map((group) => (
                <div key={group}>
                  <Title level={5} key={group} style={{ marginBottom: 16 }}>
                    {group}
                  </Title>
                  <Row gutter={16}>
                    {agentGroups[group].map((agent, index) => {
                      return (
                        <Col span={8} key={group + index}>
                          <AgentCard
                            onClick={() => onAddAgentConfirm(getAgentFromSystemAgent(agent))}
                            agent={agent as any}
                          />
                        </Col>
                      )
                    })}
                  </Row>
                </div>
              ))}
            <div style={{ minHeight: 20 }} />
          </VStack>
        </AssistantsContainer>
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
`

const AssistantsContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: row;
  height: calc(100vh - var(--navbar-height));
  padding: 15px 20px;
  overflow-y: scroll;
`

const AgentPrompt = styled.div`
  max-height: 60vh;
  overflow-y: scroll;
  max-width: 560px;
`

export default AgentsPage
