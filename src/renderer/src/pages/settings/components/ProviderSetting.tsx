import { Provider } from '@renderer/types'
import { FC, useEffect, useState } from 'react'
import styled from 'styled-components'
import { Avatar, Button, Card, Divider, Flex, Input, Space, Switch } from 'antd'
import { useProvider } from '@renderer/hooks/useProvider'
import { groupBy } from 'lodash'
import { SettingContainer, SettingSubtitle, SettingTitle } from '.'
import { getModelLogo } from '@renderer/config/provider'
import { CheckOutlined, EditOutlined, ExportOutlined, LoadingOutlined, PlusOutlined } from '@ant-design/icons'
import AddModelPopup from './AddModelPopup'
import EditModelsPopup from './EditModelsPopup'
import Link from 'antd/es/typography/Link'
import { checkApi } from '@renderer/services/api'
import { useTranslation } from 'react-i18next'
import { PROVIDER_CONFIG } from '@renderer/config/provider'

interface Props {
  provider: Provider
}

const ProviderSetting: FC<Props> = ({ provider: _provider }) => {
  const { provider } = useProvider(_provider.id)
  const [apiKey, setApiKey] = useState(provider.apiKey)
  const [apiHost, setApiHost] = useState(provider.apiHost)
  const [apiValid, setApiValid] = useState(false)
  const [apiChecking, setApiChecking] = useState(false)
  const { updateProvider, models } = useProvider(provider.id)
  const { t } = useTranslation()

  const modelGroups = groupBy(models, 'group')

  useEffect(() => {
    setApiKey(provider.apiKey)
    setApiHost(provider.apiHost)
  }, [provider])

  const onUpdateApiKey = () => updateProvider({ ...provider, apiKey })
  const onUpdateApiHost = () => updateProvider({ ...provider, apiHost })
  const onManageModel = () => EditModelsPopup.show({ provider })
  const onAddModel = () => AddModelPopup.show({ title: t('settings.models.add_model'), provider })

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

  const apiKeyDisabled = provider.id === 'ollama'

  return (
    <SettingContainer>
      <SettingTitle>
        <Flex align="center">
          <span>{t(`provider.${provider.id}`)}</span>
          {officialWebsite! && (
            <Link target="_blank" href={providerConfig.websites.official}>
              <ExportOutlined style={{ marginLeft: '8px', color: 'white', fontSize: '12px' }} />
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
        <Input
          value={apiKey}
          placeholder={t('settings.provider.api_key')}
          onChange={(e) => setApiKey(e.target.value)}
          onBlur={onUpdateApiKey}
          spellCheck={false}
          disabled={apiKeyDisabled}
          autoFocus={provider.enabled && apiKey === ''}
        />
        {!apiKeyDisabled && (
          <Button type={apiValid ? 'primary' : 'default'} ghost={apiValid} onClick={onCheckApi}>
            {apiChecking ? <LoadingOutlined spin /> : apiValid ? <CheckOutlined /> : t('settings.provider.check')}
          </Button>
        )}
      </Space.Compact>
      {apiKeyWebsite && (
        <HelpTextRow>
          <HelpLink target="_blank" href={apiKeyWebsite}>
            {t('settings.provider.get_api_key')}
          </HelpLink>
        </HelpTextRow>
      )}
      <SettingSubtitle>{t('settings.provider.api_host')}</SettingSubtitle>
      <Input
        value={apiHost}
        placeholder={t('settings.provider.api_host')}
        disabled={provider.isSystem}
        onChange={(e) => setApiHost(e.target.value)}
        onBlur={onUpdateApiHost}
      />
      <SettingSubtitle>{t('common.models')}</SettingSubtitle>
      {Object.keys(modelGroups).map((group) => (
        <Card key={group} type="inner" title={group} style={{ marginBottom: '10px' }} size="small">
          {modelGroups[group].map((model) => (
            <ModelListItem key={model.id}>
              <Avatar src={getModelLogo(model.id)} size={22} style={{ marginRight: '8px' }}>
                {model.name[0].toUpperCase()}
              </Avatar>
              {model.name}
            </ModelListItem>
          ))}
        </Card>
      ))}
      {docsWebsite && (
        <HelpTextRow>
          <HelpText>{t('settings.provider.docs_check')} </HelpText>
          <HelpLink target="_blank" href={docsWebsite}>
            {t(`provider.${provider.id}`)}
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
  justify-content: flex-start;
  padding: 5px 0;
`

const HelpTextRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 5px 0;
`

const HelpText = styled.div`
  font-size: 11px;
  color: #ffffff50;
`

const HelpLink = styled(Link)`
  font-size: 11px;
  padding: 0 5px;
`

export default ProviderSetting
