import { Navbar, NavbarCenter } from '@renderer/components/app/Navbar'
import SYSTEM_ASSISTANTS from '@renderer/config/assistants.json'
import { useAssistants } from '@renderer/hooks/useAssistant'
import { getDefaultAssistant } from '@renderer/services/assistant'
import { SystemAssistant } from '@renderer/types'
import { Col, Row, Typography } from 'antd'
import { find, groupBy } from 'lodash'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

const { Title } = Typography

const AppsPage: FC = () => {
  const { assistants, addAssistant } = useAssistants()
  const assistantGroups = groupBy(
    SYSTEM_ASSISTANTS.map((a) => ({ ...a, id: String(a.id) })),
    'group'
  )
  const { t } = useTranslation()

  const onAddAssistantConfirm = (assistant: SystemAssistant) => {
    const added = find(assistants, { id: assistant.id })

    window.modal.confirm({
      title: assistant.name,
      content: assistant.description || assistant.prompt,
      icon: null,
      closable: true,
      maskClosable: true,
      okButtonProps: { type: 'primary', disabled: Boolean(added) },
      okText: added ? t('button.added') : t('button.add'),
      onOk: () => onAddAssistant(assistant)
    })
  }

  const onAddAssistant = (assistant: SystemAssistant) => {
    addAssistant({
      ...getDefaultAssistant(),
      ...assistant,
      id: String(assistant.id)
    })
    window.message.success({
      content: t('message.assistant.added.content'),
      key: 'assistant-added',
      style: { marginTop: '5vh' }
    })
  }

  return (
    <Container>
      <Navbar>
        <NavbarCenter style={{ borderRight: 'none' }}>{t('apps.title')}</NavbarCenter>
      </Navbar>
      <ContentContainer>
        <AssistantsContainer>
          {Object.keys(assistantGroups).map((group) => (
            <div key={group}>
              <Title level={3} key={group} style={{ marginBottom: 16 }}>
                {group}
              </Title>
              <Row gutter={16}>
                {assistantGroups[group].map((assistant, index) => {
                  return (
                    <Col span={8} key={group + index}>
                      <AssistantCard onClick={() => onAddAssistantConfirm(assistant)}>
                        <EmojiHeader>{assistant.emoji}</EmojiHeader>
                        <Col>
                          <AssistantHeader>
                            <AssistantName level={5} style={{ marginBottom: 0 }}>
                              {assistant.name.replace(assistant.emoji + ' ', '')}
                            </AssistantName>
                          </AssistantHeader>
                          <AssistantCardPrompt>{assistant.prompt}</AssistantCardPrompt>
                        </Col>
                      </AssistantCard>
                    </Col>
                  )
                })}
              </Row>
            </div>
          ))}
          <div style={{ minHeight: 20 }} />
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
  overflow-y: scroll;
  background-color: var(--color-background);
`

const AssistantsContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  height: calc(100vh - var(--navbar-height));
  padding: 20px;
  max-width: 1000px;
`

const AssistantCard = styled.div`
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

const AssistantHeader = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`

const AssistantName = styled(Title)`
  font-size: 18px;
  line-height: 1.2;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  color: var(--color-white);
  font-weight: 900;
`

const AssistantCardPrompt = styled.div`
  color: #666;
  margin-top: 6px;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
`

export default AppsPage
