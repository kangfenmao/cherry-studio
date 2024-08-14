import {
  CheckOutlined,
  EditOutlined,
  ExportOutlined,
  LoadingOutlined,
  MinusCircleOutlined,
  PlusOutlined
} from '@ant-design/icons'
import { getModelLogo } from '@renderer/config/provider'
import { PROVIDER_CONFIG } from '@renderer/config/provider'
import { useProvider } from '@renderer/hooks/useProvider'
import { useTheme } from '@renderer/providers/ThemeProvider'
import { checkApi } from '@renderer/services/api'
import { Provider } from '@renderer/types'
import { Avatar, Button, Card, Divider, Flex, Input, Space, Switch } from 'antd'
import Link from 'antd/es/typography/Link'
import { groupBy } from 'lodash'
import { FC, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { SettingContainer, SettingSubtitle, SettingTitle } from '..'
import AddModelPopup from './AddModelPopup'
import EditModelsPopup from './EditModelsPopup'
import OllamSettings from './OllamaSettings'

interface Props {
  provider: Provider
}

const ProviderSetting: FC<Props> = ({ provider: _provider }) => {
  const { provider } = useProvider(_provider.id)
  const [apiKey, setApiKey] = useState(provider.apiKey)
  const [apiHost, setApiHost] = useState(provider.apiHost)
  const [apiValid, setApiValid] = useState(false)
  const [apiChecking, setApiChecking] = useState(false)
  const { updateProvider, models, removeModel } = useProvider(provider.id)
  const { t } = useTranslation()
  const { theme } = useTheme()

  const modelGroups = groupBy(models, 'group')

  useEffect(() => {
    setApiKey(provider.apiKey)
    setApiHost(provider.apiHost)
  }, [provider])

  const onUpdateApiKey = () => updateProvider({ ...provider, apiKey })
  const onUpdateApiHost = () => updateProvider({ ...provider, apiHost })
  const onManageModel = () => EditModelsPopup.show({ provider })
  const onAddModel = () => AddModelPopup.show({ title: t('settings.models.add.add_model'), provider })

  const onCheckApi = async () => {
    setApiChecking(true)
    const valid = await checkApi({ ...provider, apiKey, apiHost })
    setApiValid(valid)
    setApiChecking(false)
    setTimeout(() => setApiValid(false), 3000)
  }

  const providerConfig = PROVIDER_CONFIG[provider.id]
  const officialWebsite = providerConfig?.websites?.official
  const apiKeyWebsite = providerConfig?.websites?.apiKey
  const docsWebsite = providerConfig?.websites?.docs
  const modelsWebsite = providerConfig?.websites?.models
  const configedApiHost = providerConfig?.api?.url
  const apiEditable = provider.isSystem ? providerConfig?.api?.editable : true

  const onReset = () => {
    setApiHost(configedApiHost)
    updateProvider({ ...provider, apiHost: configedApiHost })
  }

  return (
    <SettingContainer
      style={
        theme === 'dark'
          ? { backgroundColor: 'var(--color-background)' }
          : { backgroundColor: 'var(--color-background-mute)' }
      }>
      <SettingTitle>
        <Flex align="center">
          <span>{provider.isSystem ? t(`provider.${provider.id}`) : provider.name}</span>
          {officialWebsite! && (
            <Link target="_blank" href={providerConfig.websites.official}>
              <ExportOutlined style={{ marginLeft: '8px', color: 'var(--color-text)', fontSize: '12px' }} />
            </Link>
          )}
        </Flex>
        <Switch
          defaultValue={provider.enabled}
          key={provider.id}
          onChange={(enabled) => updateProvider({ ...provider, apiKey, apiHost, enabled })}
        />
      </SettingTitle>
      <Divider style={{ width: '100%', margin: '10px 0' }} />
      <SettingSubtitle style={{ marginTop: 5 }}>{t('settings.provider.api_key')}</SettingSubtitle>
      <Space.Compact style={{ width: '100%' }}>
        <Input.Password
          value={apiKey}
          placeholder={t('settings.provider.api_key')}
          onChange={(e) => setApiKey(e.target.value)}
          onBlur={onUpdateApiKey}
          spellCheck={false}
          type="password"
          autoFocus={provider.enabled && apiKey === ''}
        />
        <Button type={apiValid ? 'primary' : 'default'} ghost={apiValid} onClick={onCheckApi}>
          {apiChecking ? <LoadingOutlined spin /> : apiValid ? <CheckOutlined /> : t('settings.provider.check')}
        </Button>
      </Space.Compact>
      {apiKeyWebsite && (
        <HelpTextRow>
          <HelpLink target="_blank" href={apiKeyWebsite}>
            {t('settings.provider.get_api_key')}
          </HelpLink>
        </HelpTextRow>
      )}
      <SettingSubtitle>{t('settings.provider.api_host')}</SettingSubtitle>
      <Space.Compact style={{ width: '100%' }}>
        <Input
          value={apiHost}
          placeholder={t('settings.provider.api_host')}
          onChange={(e) => setApiHost(e.target.value)}
          onBlur={onUpdateApiHost}
          disabled={!apiEditable}
        />
        {apiEditable && <Button onClick={onReset}>{t('settings.provider.api.url.reset')}</Button>}
      </Space.Compact>
      {provider.id === 'ollama' && <OllamSettings />}
      <SettingSubtitle>{t('common.models')}</SettingSubtitle>
      {Object.keys(modelGroups).map((group) => (
        <Card key={group} type="inner" title={group} style={{ marginBottom: '10px' }} size="small">
          {modelGroups[group].map((model) => (
            <ModelListItem key={model.id}>
              <ModelListHeader>
                <Avatar src={getModelLogo(model.id)} size={22} style={{ marginRight: '8px' }}>
                  {model.name[0].toUpperCase()}
                </Avatar>
                {model.name}
              </ModelListHeader>
              <RemoveIcon onClick={() => removeModel(model)} />
            </ModelListItem>
          ))}
        </Card>
      ))}
      {docsWebsite && (
        <HelpTextRow>
          <HelpText>{t('settings.provider.docs_check')} </HelpText>
          <HelpLink target="_blank" href={docsWebsite}>
            {t(`provider.${provider.id}`) + ' '}
            {t('common.docs')}
          </HelpLink>
          <HelpText>{t('common.and')}</HelpText>
          <HelpLink target="_blank" href={modelsWebsite}>
            {t('common.models')}
          </HelpLink>
          <HelpText>{t('settings.provider.docs_more_details')}</HelpText>
        </HelpTextRow>
      )}
      <Flex gap={10} style={{ marginTop: '10px' }}>
        <Button type="primary" onClick={onManageModel} icon={<EditOutlined />}>
          {t('button.manage')}
        </Button>
        <Button type="default" onClick={onAddModel} icon={<PlusOutlined />}>
          {t('button.add')}
        </Button>
      </Flex>
    </SettingContainer>
  )
}

const ModelListItem = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 5px 0;
`

const ModelListHeader = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`

export const HelpTextRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 5px 0;
`

export const HelpText = styled.div`
  font-size: 11px;
  color: var(--color-text);
  opacity: 0.4;
`

const HelpLink = styled(Link)`
  font-size: 11px;
  padding: 0 5px;
`

const RemoveIcon = styled(MinusCircleOutlined)`
  font-size: 18px;
  margin-left: 10px;
  color: var(--color-error);
  cursor: pointer;
  transition: all 0.2s ease-in-out;
`

export default ProviderSetting
