import { Input, Modal } from 'antd'
import { useState } from 'react'
import { TopView } from '../TopView'
import { Box } from '../Layout'
import { Agent } from '@renderer/types'
import TextArea from 'antd/es/input/TextArea'

interface AgentSettingPopupShowParams {
  agent: Agent
}

interface Props extends AgentSettingPopupShowParams {
  resolve: (agent: Agent) => void
}

const AgentSettingPopupContainer: React.FC<Props> = ({ agent, resolve }) => {
  const [name, setName] = useState(agent.name)
  const [description, setDescription] = useState(agent.description)
  const [prompt, setPrompt] = useState(agent.prompt)
  const [open, setOpen] = useState(true)

  const onOk = () => {
    setOpen(false)
  }

  const handleCancel = () => {
    setOpen(false)
  }

  const onClose = () => {
    resolve({ ...agent, name, description, prompt })
  }

  return (
    <Modal title={agent.name} open={open} onOk={onOk} onCancel={handleCancel} afterClose={onClose}>
      <Box mb={8}>Name</Box>
      <Input placeholder="Agent Name" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
      <Box mt={8} mb={8}>
        Description
      </Box>
      <TextArea
        rows={4}
        placeholder="Agent Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        autoFocus
      />
      <Box mt={8} mb={8}>
        Prompt
      </Box>
      <TextArea
        rows={4}
        placeholder="Agent Prompt"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        autoFocus
      />
    </Modal>
  )
}

export default class AgentSettingPopup {
  static topviewId = 0
  static hide() {
    TopView.hide(this.topviewId)
  }
  static show(props: AgentSettingPopupShowParams) {
    return new Promise<Agent>((resolve) => {
      this.topviewId = TopView.show(
        <AgentSettingPopupContainer
          {...props}
          resolve={(v) => {
            resolve(v)
            this.hide()
          }}
        />
      )
    })
  }
}
