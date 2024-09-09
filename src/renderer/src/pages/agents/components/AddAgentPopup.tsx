import 'emoji-picker-element'

import EmojiPicker from '@renderer/components/EmojiPicker'
import { TopView } from '@renderer/components/TopView'
import { useAgents } from '@renderer/hooks/useAgents'
import { syncAgentToAssistant } from '@renderer/services/assistant'
import { Agent } from '@renderer/types'
import { getLeadingEmoji, uuid } from '@renderer/utils'
import { Button, Form, FormInstance, Input, Modal, Popover } from 'antd'
import TextArea from 'antd/es/input/TextArea'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

interface Props {
  agent?: Agent
  resolve: (data: Agent | null) => void
}

type FieldType = {
  id: string
  name: string
  prompt: string
}

const PopupContainer: React.FC<Props> = ({ agent, resolve }) => {
  const [open, setOpen] = useState(true)
  const [form] = Form.useForm()
  const { t } = useTranslation()
  const { addAgent, updateAgent } = useAgents()
  const formRef = useRef<FormInstance>(null)
  const [emoji, setEmoji] = useState(agent?.emoji)

  const onFinish = (values: FieldType) => {
    const _emoji = emoji || getLeadingEmoji(values.name)

    if (values.name.trim() === '' || values.prompt.trim() === '') {
      return
    }

    if (agent) {
      const _agent = {
        ...agent,
        name: values.name,
        emoji: _emoji,
        prompt: values.prompt
      }
      updateAgent(_agent)
      syncAgentToAssistant(_agent)
      resolve(_agent)
      setOpen(false)
      return
    }

    const _agent = {
      id: uuid(),
      name: values.name,
      emoji: _emoji,
      prompt: values.prompt,
      group: 'user'
    }

    addAgent(_agent)
    resolve(_agent)
    setOpen(false)
  }

  const onCancel = () => {
    setOpen(false)
  }

  const onClose = () => {
    resolve(null)
  }

  useEffect(() => {
    if (agent) {
      form.setFieldsValue({
        name: agent.name,
        prompt: agent.prompt
      })
    }
  }, [agent, form])

  return (
    <Modal
      title={agent ? t('agents.edit.title') : t('agents.add.title')}
      open={open}
      onOk={() => formRef.current?.submit()}
      onCancel={onCancel}
      maskClosable={false}
      afterClose={onClose}
      okText={agent ? t('common.save') : t('agents.add.button')}
      centered>
      <Form
        ref={formRef}
        form={form}
        labelCol={{ flex: '80px' }}
        labelAlign="left"
        colon={false}
        style={{ marginTop: 25 }}
        onFinish={onFinish}>
        <Form.Item name="name" label="Emoji">
          <Popover content={<EmojiPicker onEmojiClick={setEmoji} />} trigger="click" arrow>
            <Button icon={emoji && <span style={{ fontSize: 20 }}>{emoji}</span>}>{t('common.select')}</Button>
          </Popover>
        </Form.Item>
        <Form.Item name="name" label={t('agents.add.name')} rules={[{ required: true }]}>
          <Input placeholder={t('agents.add.name.placeholder')} spellCheck={false} allowClear />
        </Form.Item>
        <Form.Item name="prompt" label={t('agents.add.prompt')} rules={[{ required: true }]}>
          <TextArea placeholder={t('agents.add.prompt.placeholder')} spellCheck={false} rows={10} />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default class AddAgentPopup {
  static topviewId = 0
  static hide() {
    TopView.hide('AddAgentPopup')
  }
  static show(agent?: Agent) {
    return new Promise<Agent | null>((resolve) => {
      TopView.show(
        <PopupContainer
          agent={agent}
          resolve={(v) => {
            resolve(v)
            this.hide()
          }}
        />,
        'AddAgentPopup'
      )
    })
  }
}
