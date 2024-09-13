import 'emoji-picker-element'

import { LoadingOutlined, ThunderboltOutlined } from '@ant-design/icons'
import EmojiPicker from '@renderer/components/EmojiPicker'
import { TopView } from '@renderer/components/TopView'
import { useAgents } from '@renderer/hooks/useAgents'
import { fetchGenerate } from '@renderer/services/api'
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
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)

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

  const handleButtonClick = async () => {
    const prompt = `你是一个专业的prompt优化助手，我会给你一段prompt，你需要帮我优化它，仅回复优化后的prompt不要添加任何解释，使用[CRISPE提示框架]回复。`
    setLoading(true)
    try {
      const prefixedContent = `请帮我优化下面这段prompt，使用CRISPE提示框架，请使用Markdown格式回复: ${content}`
      const generatedText = await fetchGenerate({ prompt, content: prefixedContent })
      setContent(generatedText)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

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
          <div style={{ position: 'relative' }}>
            <TextArea
              placeholder={t('agents.add.prompt.placeholder')}
              spellCheck={false}
              rows={10}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <Button
              icon={loading ? <LoadingOutlined /> : <ThunderboltOutlined />}
              style={{
                position: 'absolute',
                top: 8,
                right: 8
              }}
              onClick={handleButtonClick}
              disabled={loading}></Button>
          </div>
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
