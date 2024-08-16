import AssistantSettingPopup from '@renderer/components/Popups/AssistantSettingPopup'
import { useAssistant } from '@renderer/hooks/useAssistant'
import { syncAsistantToAgent } from '@renderer/services/assistant'
import { Assistant } from '@renderer/types'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

interface Props {
  assistant: Assistant
}

const Prompt: FC<Props> = ({ assistant }) => {
  const { t } = useTranslation()
  const { updateAssistant } = useAssistant(assistant.id)

  const prompt = assistant.prompt || t('chat.default.description')

  const onEdit = async () => {
    const _assistant = await AssistantSettingPopup.show({ assistant })
    updateAssistant(_assistant)
    syncAsistantToAgent(_assistant)
  }

  if (!prompt) {
    return null
  }

  return (
    <Container onClick={onEdit}>
      <Text>{prompt}</Text>
    </Container>
  )
}

const Container = styled.div`
  padding: 10px 20px;
  background-color: var(--color-background-soft);
  margin-bottom: 20px;
  margin: 0 20px 20px 20px;
  border-radius: 6px;
  cursor: pointer;
`

const Text = styled.div`
  color: var(--color-text-2);
  font-size: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`

export default Prompt
