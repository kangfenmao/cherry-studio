import { FC } from 'react'
import { SettingContainer, SettingDivider, SettingSubtitle, SettingTitle } from './components/SettingComponent'
import { Input } from 'antd'
import TextArea from 'antd/es/input/TextArea'
import { useDefaultAssistant } from '@renderer/hooks/useAssistant'

const AssistantSettings: FC = () => {
  const { defaultAssistant, updateDefaultAssistant } = useDefaultAssistant()

  return (
    <SettingContainer>
      <SettingTitle>Default Assistant</SettingTitle>
      <SettingDivider />
      <SettingSubtitle>Name</SettingSubtitle>
      <Input
        placeholder="Assistant Name"
        value={defaultAssistant.name}
        onChange={(e) => updateDefaultAssistant({ ...defaultAssistant, name: e.target.value })}
      />
      <SettingSubtitle>Description</SettingSubtitle>
      <TextArea
        rows={4}
        placeholder="Assistant Description"
        value={defaultAssistant.description}
        onChange={(e) => updateDefaultAssistant({ ...defaultAssistant, description: e.target.value })}
      />
      <SettingSubtitle>Prompt</SettingSubtitle>
      <TextArea
        rows={4}
        placeholder="Assistant Prompt"
        value={defaultAssistant.prompt}
        onChange={(e) => updateDefaultAssistant({ ...defaultAssistant, prompt: e.target.value })}
      />
    </SettingContainer>
  )
}

export default AssistantSettings
