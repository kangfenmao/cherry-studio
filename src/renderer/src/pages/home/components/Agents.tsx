import { FC } from 'react'
import styled from 'styled-components'
import { IconMore } from '@douyinfe/semi-icons'
import { Dropdown } from '@douyinfe/semi-ui'
import useAgents from '@renderer/hooks/useAgents'

const Agents: FC = () => {
  const { agents, setAgent, removeAgent } = useAgents()

  return (
    <Container>
      {agents.map((agent) => (
        <AgentItem key={agent.id} onClick={() => setAgent(agent)} className={agent.id === agent?.id ? 'active' : ''}>
          <Dropdown
            trigger="click"
            stopPropagation
            render={
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => removeAgent(agent.id)}>Delete</Dropdown.Item>
              </Dropdown.Menu>
            }>
            <IconMore style={{ position: 'absolute', right: 12, top: 12 }} />
          </Dropdown>
          <AgentName>{agent.name}</AgentName>
          <AgentLastMessage>{agent.lastMessage}</AgentLastMessage>
          <AgentTime>{agent.lastMessageAt}</AgentTime>
        </AgentItem>
      ))}
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-width: var(--conversations-width);
  max-width: var(--conversations-width);
  border-right: 1px solid #ffffff20;
  height: calc(100vh - var(--navbar-height));
  padding: 10px;
  overflow-y: scroll;
  &::-webkit-scrollbar {
    display: none;
  }
`

const AgentItem = styled.div`
  display: flex;
  flex-direction: column;
  padding: 10px;
  position: relative;
  cursor: pointer;
  .semi-icon {
    display: none;
  }
  &:hover {
    background-color: var(--color-background-soft);
    .semi-icon {
      display: block;
    }
  }
  &.active {
    background-color: var(--color-background-mute);
    cursor: pointer;
  }
  border-radius: 8px;
  margin-bottom: 10px;
`

const AgentTime = styled.div`
  font-size: 12px;
  color: var(--color-text-2);
`

const AgentName = styled.div`
  font-size: 14px;
  color: var(--color-text-1);
  font-weight: bold;
`

const AgentLastMessage = styled.div`
  font-size: 12px;
  line-height: 20px;
  color: var(--color-text-2);
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-line-clamp: 1;
  height: 20px;
`

export default Agents
