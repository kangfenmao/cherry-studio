import { LoadingOutlined, ThunderboltOutlined } from '@ant-design/icons'
import { Navbar, NavbarCenter } from '@renderer/components/app/Navbar'
import EmojiPicker from '@renderer/components/EmojiPicker'
import { useAgent, useAgents } from '@renderer/hooks/useAgents'
import { fetchGenerate } from '@renderer/services/api'
import { syncAgentToAssistant } from '@renderer/services/assistant'
import { Agent } from '@renderer/types'
import { getLeadingEmoji } from '@renderer/utils'
import { Button, Form, FormInstance, Input, Popover } from 'antd'
import TextArea from 'antd/es/input/TextArea'
import { FC, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router'
import styled from 'styled-components'

type FieldType = {
  id: string
  name: string
  prompt: string
}

const AgentEditPage: FC = () => {
  const { t } = useTranslation()
  const { id } = useParams()
  const { agent } = useAgent(id!)
  const [form] = Form.useForm()
  const formRef = useRef<FormInstance>(null)
  const { addAgent, updateAgent } = useAgents()
  const [emoji, setEmoji] = useState(agent?.emoji)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const onFinish = (values: FieldType) => {
    const _emoji = emoji || getLeadingEmoji(values.name)

    if (values.name.trim() === '' || values.prompt.trim() === '') {
      return
    }

    const _agent = {
      ...agent,
      name: values.name,
      emoji: _emoji,
      prompt: values.prompt
    } as Agent

    updateAgent(_agent)
    syncAgentToAssistant(_agent)

    navigate(-1)
  }

  const handleButtonClick = async () => {
    const prompt = `你是一个专业的 prompt 优化助手，我会给你一段prompt，你需要帮我优化它，仅回复优化后的 prompt 不要添加任何解释，使用 [CRISPE提示框架] 回复。`

    const name = formRef.current?.getFieldValue('name')
    const content = formRef.current?.getFieldValue('prompt')
    const promptText = content || name

    if (!promptText) {
      return
    }

    if (content) {
      navigator.clipboard.writeText(content)
    }

    setLoading(true)

    try {
      const prefixedContent = `请帮我优化下面这段 prompt，使用 CRISPE 提示框架，请使用 Markdown 格式回复，不要使用 codeblock: ${promptText}`
      const generatedText = await fetchGenerate({ prompt, content: prefixedContent })
      formRef.current?.setFieldValue('prompt', generatedText)
    } catch (error) {
      console.error('Error fetching data:', error)
    }

    setLoading(false)
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
    <Container>
      <Navbar>
        <NavbarCenter style={{ borderRight: 'none' }}>{t('agents.edit.title')}</NavbarCenter>
      </Navbar>
      <ContentContainer id="content-container">
        <Form
          ref={formRef}
          layout="vertical"
          form={form}
          labelAlign="left"
          colon={false}
          style={{ width: '100%' }}
          onFinish={onFinish}>
          <Form.Item name="name" label="Emoji">
            <Popover content={<EmojiPicker onEmojiClick={setEmoji} />} arrow placement="rightBottom">
              <Button icon={emoji && <span style={{ fontSize: 20 }}>{emoji}</span>}>{t('common.select')}</Button>
            </Popover>
          </Form.Item>
          <Form.Item name="name" label={t('agents.add.name')} rules={[{ required: true }]}>
            <Input placeholder={t('agents.add.name.placeholder')} spellCheck={false} allowClear />
          </Form.Item>
          <div style={{ position: 'relative' }}>
            <Form.Item
              name="prompt"
              label={t('agents.add.prompt')}
              rules={[{ required: true }]}
              style={{ position: 'relative' }}>
              <TextArea placeholder={t('agents.add.prompt.placeholder')} spellCheck={false} rows={10} />
            </Form.Item>
            <Button
              icon={loading ? <LoadingOutlined /> : <ThunderboltOutlined />}
              onClick={handleButtonClick}
              style={{ position: 'absolute', top: 8, right: 8 }}
              disabled={loading}
            />
          </div>
          <Form.Item wrapperCol={{ span: 16 }}>
            <Button type="primary" htmlType="submit">
              {t('common.save')}
            </Button>
            <Button type="link" onClick={() => navigate(-1)}>
              {t('common.cancel')}
            </Button>
          </Form.Item>
        </Form>
        <div style={{ minHeight: 50 }} />
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
  flex-direction: column;
  padding: 20px;
  overflow-y: scroll;
`

export default AgentEditPage
