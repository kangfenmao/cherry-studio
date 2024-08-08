import { EditOutlined, MessageOutlined, TranslationOutlined } from '@ant-design/icons'
import { useDefaultModel } from '@renderer/hooks/useAssistant'
import { useProviders } from '@renderer/hooks/useProvider'
import { Model } from '@renderer/types'
import { Select } from 'antd'
import { find, upperFirst } from 'lodash'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'

import { SettingContainer, SettingDivider, SettingTitle } from './components'

const ModelSettings: FC = () => {
  const { defaultModel, topicNamingModel, translateModel, setDefaultModel, setTopicNamingModel, setTranslateModel } =
    useDefaultModel()
  const { providers } = useProviders()
  const allModels = providers.map((p) => p.models).flat()
  const { t } = useTranslation()

  const selectOptions = providers
    .filter((p) => p.models.length > 0)
    .map((p) => ({
      label: p.isSystem ? t(`provider.${p.id}`) : p.name,
      title: p.name,
      options: p.models
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((m) => ({
          label: upperFirst(m.name),
          value: m.id
        }))
    }))

  const iconStyle = { fontSize: 16, marginRight: 8 }

  return (
    <SettingContainer>
      <SettingTitle>
        <div>
          <MessageOutlined style={iconStyle} />
          {t('settings.models.default_assistant_model')}
        </div>
      </SettingTitle>
      <SettingDivider />
      <Select
        defaultValue={defaultModel.id}
        style={{ width: 360 }}
        onChange={(id) => setDefaultModel(find(allModels, { id }) as Model)}
        options={selectOptions}
      />
      <div style={{ height: 30 }} />
      <SettingTitle>
        <div>
          <EditOutlined style={iconStyle} />
          {t('settings.models.topic_naming_model')}
        </div>
      </SettingTitle>
      <SettingDivider />
      <Select
        defaultValue={topicNamingModel.id}
        style={{ width: 360 }}
        onChange={(id) => setTopicNamingModel(find(allModels, { id }) as Model)}
        options={selectOptions}
      />
      <div style={{ height: 30 }} />
      <SettingTitle>
        <div>
          <TranslationOutlined style={iconStyle} />
          {t('settings.models.translate_model')}
        </div>
      </SettingTitle>
      <SettingDivider />
      <Select
        defaultValue={translateModel?.id}
        style={{ width: 360 }}
        onChange={(id) => setTranslateModel(find(allModels, { id }) as Model)}
        options={selectOptions}
        placeholder={t('settings.models.empty')}
      />
    </SettingContainer>
  )
}

export default ModelSettings
