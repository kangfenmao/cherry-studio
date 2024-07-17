import { Navbar, NavbarCenter } from '@renderer/components/app/Navbar'
import { Button, Col, Row, Tooltip, Typography } from 'antd'
import { find, groupBy } from 'lodash'
import { FC } from 'react'
import styled from 'styled-components'
import { SystemAssistant } from '@renderer/types'
import { getDefaultAssistant } from '@renderer/services/assistant'
import { useAssistants } from '@renderer/hooks/useAssistant'
import { colorPrimary } from '@renderer/config/antd'
import { useTranslation } from 'react-i18next'
import SYSTEM_ASSISTANTS from '@renderer/config/assistants.json'

const { Title } = Typography

const AppsPage: FC = () => {
  const { assistants, addAssistant } = useAssistants()
  const assistantGroups = groupBy(
    SYSTEM_ASSISTANTS.map((a) => ({ ...a, id: String(a.id) })),
    'group'
  )
  const { t } = useTranslation()

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
        {Object.keys(assistantGroups).map((group) => (
          <div key={group}>
            <Title level={3} key={group} style={{ marginBottom: 16 }}>
              {group}
            </Title>
            <Row gutter={16}>
              {assistantGroups[group].map((assistant, index) => {
                const added = find(assistants, { id: assistant.id })
                return (
                  <Col span={8} key={group + index}>
                    <AssistantCard>
                      <EmojiHeader>{assistant.emoji}</EmojiHeader>
                      <Col>
                        <AssistantHeader>
                          <AssistantName level={5} style={{ marginBottom: 0, color: colorPrimary }}>
                            {assistant.name.replace(assistant.emoji + ' ', '')}
                          </AssistantName>
                        </AssistantHeader>
                        <AssistantCardPrompt>{assistant.prompt}</AssistantCardPrompt>
                        <Row>
                          {added && (
                            <Button type="default" size="small" disabled>
                              {t('button.added')}
                            </Button>
                          )}
                          {!added && (
                            <Tooltip placement="top" title=" Add to assistant list " arrow>
                              <Button type="default" size="small" onClick={() => onAddAssistant(assistant as any)}>
                                {t('button.add')}
                              </Button>
                            </Tooltip>
                          )}
                        </Row>
                      </Col>
                    </AssistantCard>
                  </Col>
                )
              })}
            </Row>
          </div>
        ))}
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

const EmojiHeader = styled.div`
  width: 36px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  margin-right: 5px;
  font-size: 36px;
  line-height: 36px;
`

const ContentContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  height: calc(100vh - var(--navbar-height));
  padding: 20px;
  overflow-y: scroll;
`

const AssistantCard = styled.div`
  display: flex;
  flex-direction: row;
  margin-bottom: 16px;
  background-color: #2b2b2b;
  border-radius: 10px;
  padding: 15px;
  position: relative;
`

const AssistantName = styled(Title)`
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
`

const AssistantHeader = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`

const AssistantCardPrompt = styled.div`
  color: #eee;
  margin-top: 10px;
  margin-bottom: 10px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
`

export default AppsPage
