import { Input, Modal } from 'antd'
import { useState } from 'react'
import { TopView } from '../TopView'
import { Box } from '../Layout'
import { Agent } from '@renderer/types'

interface AgentSettingPopupShowParams {
  agent: Agent
}

interface Props extends AgentSettingPopupShowParams {
  resolve: (agent: Agent) => void
}

const AgentSettingPopupContainer: React.FC<Props> = ({ agent, resolve }) => {
  const [name, setName] = useState(agent.name)
  const [description, setDescription] = useState(agent.description)
  const [open, setOpen] = useState(true)

  const onOk = () => {
    setOpen(false)
  }

  const handleCancel = () => {
    setOpen(false)
  }

  const onClose = () => {
    resolve({ ...agent, name, description })
  }

  return (
    <Modal title={agent.name} open={open} onOk={onOk} onCancel={handleCancel} afterClose={onClose}>
      <Box mb={8}>Agent name</Box>
      <Input placeholder="Agent Name" value={name} onChange={(e) => setName(e.target.value)} allowClear autoFocus />
      <Box mb={8}>Description</Box>
      <Input
        placeholder="Agent Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        allowClear
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
