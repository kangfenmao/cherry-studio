import { useAssistant } from '@renderer/hooks/useAssistant'
import { syncAsistantToAgent } from '@renderer/services/assistant'
import { Assistant } from '@renderer/types'
import { Button, Input } from 'antd'
import TextArea from 'antd/es/input/TextArea'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Box, HStack, VStack } from '../Layout'

const AssistantPromptSettings: React.FC<{ assistant: Assistant; onOk: () => void }> = (props) => {
  const { assistant, updateAssistant } = useAssistant(props.assistant.id)
  const [name, setName] = useState(assistant.name)
  const [prompt, setPrompt] = useState(assistant.prompt)
  const { t } = useTranslation()

  const onUpdate = () => {
    const _assistant = { ...assistant, name, prompt }
    updateAssistant(_assistant)
    syncAsistantToAgent(_assistant)
  }

  return (
    <VStack flex={1}>
      <Box mb={8} style={{ fontWeight: 'bold' }}>
        {t('common.name')}
      </Box>
      <Input
        placeholder={t('common.assistant') + t('common.name')}
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={onUpdate}
      />
      <Box mt={8} mb={8} style={{ fontWeight: 'bold' }}>
        {t('common.prompt')}
      </Box>
      <TextArea
        rows={10}
        placeholder={t('common.assistant') + t('common.prompt')}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onBlur={onUpdate}
        style={{ minHeight: 'calc(80vh - 200px)', maxHeight: 'calc(80vh - 150px)' }}
      />
      <HStack width="100%" justifyContent="flex-end" mt="10px">
        <Button type="primary" onClick={props.onOk}>
          {t('common.close')}
        </Button>
      </HStack>
    </VStack>
  )
}

export default AssistantPromptSettings
