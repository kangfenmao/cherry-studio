import { Agent } from '@renderer/types'
import { Col, Typography } from 'antd'
import styled from 'styled-components'

interface Props {
  agent: Agent
  onClick?: () => void
}

const { Title } = Typography

const AgentCard: React.FC<Props> = ({ agent, onClick }) => {
  return (
    <Container onClick={onClick}>
      {agent.emoji && <EmojiHeader>{agent.emoji}</EmojiHeader>}
      <Col>
        <AgentHeader>
          <AgentName level={5} style={{ marginBottom: 0 }}>
            {agent.name}
          </AgentName>
        </AgentHeader>
        <AgentCardPrompt>{agent.prompt}</AgentCardPrompt>
      </Col>
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: row;
  margin-bottom: 16px;
  background-color: var(--color-background-soft);
  border: 0.5px solid var(--color-border);
  border-radius: 10px;
  padding: 15px;
  position: relative;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  &:hover {
    background-color: var(--color-background-mute);
  }
`
const EmojiHeader = styled.div`
  width: 25px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  margin-right: 5px;
  font-size: 25px;
  line-height: 25px;
`

const AgentHeader = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`

const AgentName = styled(Title)`
  font-size: 18px;
  line-height: 1.2;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  color: var(--color-white);
  font-weight: 900;
`

const AgentCardPrompt = styled.div`
  color: #666;
  margin-top: 6px;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
`

export default AgentCard
