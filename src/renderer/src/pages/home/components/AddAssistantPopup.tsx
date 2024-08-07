import { TopView } from '@renderer/components/TopView'
import systemAgents from '@renderer/config/agents.json'
import { useAgents } from '@renderer/hooks/useAgents'
import { useAssistants, useDefaultAssistant } from '@renderer/hooks/useAssistant'
import { covertAgentToAssistant } from '@renderer/services/assistant'
import { Agent, Assistant } from '@renderer/types'
import { Input, Modal, Tag } from 'antd'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

interface Props {
  resolve: (value: Assistant | undefined) => void
}

const PopupContainer: React.FC<Props> = ({ resolve }) => {
  const [open, setOpen] = useState(true)
  const { t } = useTranslation()
  const { agents: userAgents } = useAgents()
  const [searchText, setSearchText] = useState('')
  const { defaultAssistant } = useDefaultAssistant()
  const { assistants, addAssistant } = useAssistants()

  const defaultAgent: Agent = useMemo(
    () => ({
      id: defaultAssistant.id,
      name: defaultAssistant.name,
      emoji: '',
      prompt: defaultAssistant.prompt,
      group: 'system'
    }),
    [defaultAssistant.id, defaultAssistant.name, defaultAssistant.prompt]
  )

  const agents = useMemo(() => {
    const allAgents = [defaultAgent, ...userAgents, ...systemAgents] as Agent[]
    const list = allAgents.filter((agent) => !assistants.map((a) => a.id).includes(agent.id))
    return searchText
      ? list.filter((agent) => agent.name.toLowerCase().includes(searchText.trim().toLocaleLowerCase()))
      : list
  }, [assistants, defaultAgent, searchText, userAgents])

  const onCreateAssistant = (agent: Agent) => {
    if (assistants.map((a) => a.id).includes(String(agent.id))) return
    const assistant = covertAgentToAssistant(agent)
    addAssistant(assistant)
    resolve(assistant)
    setOpen(false)
  }

  const onCancel = () => {
    setOpen(false)
  }

  const onClose = async () => {
    resolve(undefined)
    AddAssistantPopup.hide()
  }

  return (
    <Modal
      style={{ marginTop: '5vh' }}
      title={t('chat.add.assistant.title')}
      open={open}
      onCancel={onCancel}
      afterClose={onClose}
      transitionName=""
      maskTransitionName=""
      footer={null}>
      <Input
        placeholder={t('common.search')}
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        allowClear
        autoFocus
        style={{ marginBottom: 16 }}
      />
      <Container>
        {agents.map((agent) => (
          <AgentItem key={agent.id} onClick={() => onCreateAssistant(agent)}>
            {agent.emoji} {agent.name}
            {agent.group === 'system' && <Tag color="orange">{t('agents.tag.system')}</Tag>}
            {agent.group === 'user' && <Tag color="green">{t('agents.tag.user')}</Tag>}
          </AgentItem>
        ))}
      </Container>
    </Modal>
  )
}

const Container = styled.div`
  height: 50vh;
  overflow-y: auto;
  &::-webkit-scrollbar {
    display: none;
  }
`

const AgentItem = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 8px;
  border-radius: 8px;
  user-select: none;
  background-color: var(--color-background-soft);
  margin-bottom: 8px;
  cursor: pointer;
  .anticon {
    font-size: 16px;
    color: var(--color-icon);
  }
  &:hover {
    background-color: var(--color-background-mute);
  }
`

export default class AddAssistantPopup {
  static topviewId = 0
  static hide() {
    TopView.hide('AddAssistantPopup')
  }
  static show() {
    return new Promise<Assistant | undefined>((resolve) => {
      TopView.show(<PopupContainer resolve={resolve} />, 'AddAssistantPopup')
    })
  }
}
