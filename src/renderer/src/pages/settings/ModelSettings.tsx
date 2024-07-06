import { FC } from 'react'
import { SettingContainer, SettingDivider, SettingTitle } from './components/SettingComponent'
import { Select } from 'antd'
import { useProviders } from '@renderer/hooks/useProvider'
import { useDefaultModel } from '@renderer/hooks/useAssistant'
import { find } from 'lodash'
import { Model } from '@renderer/types'

const ModelSettings: FC = () => {
  const { defaultModel, topicNamingModel, setDefaultModel, setTopicNamingModel } = useDefaultModel()
  const providers = useProviders()
  const allModels = providers.map((p) => p.models).flat()

  return (
    <SettingContainer>
      <SettingTitle>Default Assistant Model</SettingTitle>
      <SettingDivider />
      <Select
        defaultValue={defaultModel.id}
        style={{ width: 200 }}
        onChange={(id) => setDefaultModel(find(allModels, { id }) as Model)}
        options={providers.map((p) => ({
          label: p.name,
          title: p.name,
          options: p.models.map((m) => ({
            label: m.name,
            value: m.id
          }))
        }))}
      />
      <div style={{ height: 40 }} />
      <SettingTitle>Topic Naming Model</SettingTitle>
      <SettingDivider />
      <Select
        defaultValue={topicNamingModel.id}
        style={{ width: 200 }}
        onChange={(id) => setTopicNamingModel(find(allModels, { id }) as Model)}
        options={providers.map((p) => ({
          label: p.name,
          title: p.name,
          options: p.models.map((m) => ({
            label: m.name,
            value: m.id
          }))
        }))}
      />
    </SettingContainer>
  )
}

export default ModelSettings
