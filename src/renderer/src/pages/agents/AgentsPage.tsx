import { SearchOutlined } from '@ant-design/icons'
import { Navbar, NavbarCenter } from '@renderer/components/app/Navbar'
import Scrollbar from '@renderer/components/Scrollbar'
import SystemAgents from '@renderer/config/agents.json'
import { createAssistantFromAgent } from '@renderer/services/assistant'
import { Agent } from '@renderer/types'
import { uuid } from '@renderer/utils'
import { Col, Input, Row, Tabs as TabsAntd, Typography } from 'antd'
import { groupBy, omit } from 'lodash'
import { FC, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import ReactMarkdown from 'react-markdown'
import styled from 'styled-components'

import Agents from './Agents'
import AgentCard from './components/AgentCard'

const { Title } = Typography

const getAgentsFromSystemAgents = () => {
  const agents: Agent[] = []
  for (let i = 0; i < SystemAgents.length; i++) {
    for (let j = 0; j < SystemAgents[i].group.length; j++) {
      const agent = { ...SystemAgents[i], group: SystemAgents[i].group[j], topics: [], type: 'agent' } as Agent
      agents.push(agent)
    }
  }
  return agents
}

const AgentsPage: FC = () => {
  const [search, setSearch] = useState('')
  const agentGroups = useMemo(() => groupBy(getAgentsFromSystemAgents(), 'group'), [])
  const { t } = useTranslation()

  const filteredAgentGroups = useMemo(() => {
    if (!search.trim()) return agentGroups

    const filtered = {}
    Object.entries(agentGroups).forEach(([group, agents]) => {
      const filteredAgents = agents.filter(
        (agent) =>
          agent.name.toLowerCase().includes(search.toLowerCase()) ||
          agent.prompt?.toLowerCase().includes(search.toLowerCase())
      )
      if (filteredAgents.length > 0) {
        filtered[group] = filteredAgents
      }
    })
    return filtered
  }, [agentGroups, search])

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
        <NavbarCenter style={{ borderRight: 'none', justifyContent: 'space-between' }}>
          {t('agents.title')}
          <Input
            placeholder={t('common.search')}
            className="nodrag"
            style={{ width: '30%', height: 28 }}
            size="small"
            variant="filled"
            allowClear
            suffix={<SearchOutlined />}
            value={search}
            maxLength={50}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div style={{ width: 80 }} />
        </NavbarCenter>
      </Navbar>
      <ContentContainer id="content-container">
        <AssistantsContainer>
          <Agents onClick={onAddAgentConfirm} />
          <Tabs
            tabPosition="left"
            animated
            items={Object.keys(filteredAgentGroups).map((group, i) => {
              const id = String(i + 1)
              return {
                label: group,
                key: id,
                children: (
                  <TabContent key={group}>
                    <Title level={5} key={group} style={{ marginBottom: 16 }}>
                      {group}
                    </Title>
                    <Row gutter={16}>
                      {filteredAgentGroups[group].map((agent, index) => {
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
                  </TabContent>
                )
              }
            })}
          />
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
`

const TabContent = styled(Scrollbar)`
  height: calc(100vh - var(--navbar-height));
  padding: 10px 10px 10px 15px;
  margin-right: 4px;
`

const AgentPrompt = styled.div`
  max-height: 60vh;
  overflow-y: scroll;
  max-width: 560px;
`

const Tabs = styled(TabsAntd)`
  display: flex;
  flex: 1;
  flex-direction: row-reverse;
  .ant-tabs-tabpane {
    padding-left: 0 !important;
  }
  .ant-tabs-nav-list {
    padding: 10px;
  }
  .ant-tabs-nav-operations {
    display: none !important;
  }
  .ant-tabs-tab {
    margin: 0 !important;
    border-radius: 6px;
    margin-bottom: 5px !important;
    font-size: 14px;
    &:hover {
      background-color: var(--color-background-soft);
    }
  }
  .ant-tabs-tab-active {
    background-color: var(--color-background-mute);
    border-right: none;
  }
  .ant-tabs-content-holder {
    border-left: 0.5px solid var(--color-border);
    border-right: 0.5px solid var(--color-border);
  }
  .ant-tabs-ink-bar {
    display: none;
  }
`

export default AgentsPage
