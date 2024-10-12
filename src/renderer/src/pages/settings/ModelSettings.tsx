import { EditOutlined, MessageOutlined, TranslationOutlined } from '@ant-design/icons'
import { useDefaultModel } from '@renderer/hooks/useAssistant'
import { useProviders } from '@renderer/hooks/useProvider'
import { getModelUniqId, hasModel } from '@renderer/services/model'
import { Model } from '@renderer/types'
import { Select } from 'antd'
import { find, sortBy } from 'lodash'
import { FC, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { SettingContainer, SettingDivider, SettingTitle } from '.'

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
      options: sortBy(p.models, 'name').map((m) => ({
        label: m.name,
        value: getModelUniqId(m)
      }))
    }))

  const defaultModelValue = useMemo(
    () => (hasModel(defaultModel) ? getModelUniqId(defaultModel) : undefined),
    [defaultModel]
  )

  const defaultTopicNamingModel = useMemo(
    () => (hasModel(topicNamingModel) ? getModelUniqId(topicNamingModel) : undefined),
    [topicNamingModel]
  )

  const defaultTranslateModel = useMemo(
    () => (hasModel(translateModel) ? getModelUniqId(translateModel) : undefined),
    [translateModel]
  )

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
        value={defaultModelValue}
        defaultValue={defaultModelValue}
        style={{ width: 360 }}
        onChange={(value) => setDefaultModel(find(allModels, JSON.parse(value)) as Model)}
        options={selectOptions}
        placeholder={t('settings.models.empty')}
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
        value={defaultTopicNamingModel}
        defaultValue={defaultTopicNamingModel}
        style={{ width: 360 }}
        onChange={(value) => setTopicNamingModel(find(allModels, JSON.parse(value)) as Model)}
        options={selectOptions}
        placeholder={t('settings.models.empty')}
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
        value={defaultTranslateModel}
        defaultValue={defaultTranslateModel}
        style={{ width: 360 }}
        onChange={(value) => setTranslateModel(find(allModels, JSON.parse(value)) as Model)}
        options={selectOptions}
        placeholder={t('settings.models.empty')}
      />
    </SettingContainer>
  )
}

const iconStyle = { fontSize: 16, marginRight: 8 }

export default ModelSettings
