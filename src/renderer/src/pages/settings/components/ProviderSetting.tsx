import { Provider } from '@renderer/types'
import { FC, useEffect, useState } from 'react'
import styled from 'styled-components'
import { Avatar, Button, Card, Divider, Flex, Input, Space, Switch } from 'antd'
import { useProvider } from '@renderer/hooks/useProvider'
import { groupBy } from 'lodash'
import { SettingContainer, SettingSubtitle, SettingTitle } from '.'
import { getModelLogo } from '@renderer/services/provider'
import { CheckOutlined, EditOutlined, ExportOutlined, LoadingOutlined, PlusOutlined } from '@ant-design/icons'
import AddModelPopup from './AddModelPopup'
import EditModelsPopup from './EditModelsPopup'
import Link from 'antd/es/typography/Link'
import { checkApi } from '@renderer/services/api'

interface Props {
  provider: Provider
}

const PROVIDER_CONFIG = {
  openai: {
    websites: {
      official: 'https://openai.com/',
      apiKey: 'https://platform.openai.com/api-keys',
      docs: 'https://platform.openai.com/docs',
      models: 'https://platform.openai.com/docs/models'
    }
  },
  silicon: {
    websites: {
      official: 'https://www.siliconflow.cn/',
      apiKey: 'https://cloud.siliconflow.cn/account/ak',
      docs: 'https://docs.siliconflow.cn/',
      models: 'https://docs.siliconflow.cn/docs/model-names'
    }
  },
  deepseek: {
    websites: {
      official: 'https://deepseek.com/',
      apiKey: 'https://platform.deepseek.com/api_keys',
      docs: 'https://platform.deepseek.com/api-docs/',
      models: 'https://platform.deepseek.com/api-docs/'
    }
  },
  yi: {
    websites: {
      official: 'https://platform.lingyiwanwu.com/',
      apiKey: 'https://platform.lingyiwanwu.com/apikeys',
      docs: 'https://platform.lingyiwanwu.com/docs',
      models: 'https://platform.lingyiwanwu.com/docs#%E6%A8%A1%E5%9E%8B'
    }
  },
  zhipu: {
    websites: {
      official: 'https://open.bigmodel.cn/',
      apiKey: 'https://open.bigmodel.cn/usercenter/apikeys',
      docs: 'https://open.bigmodel.cn/dev/howuse/introduction',
      models: 'https://open.bigmodel.cn/modelcenter/square'
    }
  },
  moonshot: {
    websites: {
      official: 'https://moonshot.ai/',
      apiKey: 'https://platform.moonshot.cn/console/api-keys',
      docs: 'https://platform.moonshot.cn/docs/',
      models: 'https://platform.moonshot.cn/docs/intro#%E6%A8%A1%E5%9E%8B%E5%88%97%E8%A1%A8'
    }
  },
  openrouter: {
    websites: {
      official: 'https://openrouter.ai/',
      apiKey: 'https://openrouter.ai/settings/keys',
      docs: 'https://openrouter.ai/docs/quick-start',
      models: 'https://openrouter.ai/docs/models'
    }
  },
  groq: {
    websites: {
      official: 'https://groq.com/',
      apiKey: 'https://console.groq.com/keys',
      docs: 'https://console.groq.com/docs/quickstart',
      models: 'https://console.groq.com/docs/models'
    }
  },
  ollama: {
    websites: {
      official: 'https://ollama.com/',
      docs: 'https://github.com/ollama/ollama/tree/main/docs',
      models: 'https://ollama.com/library'
    }
  }
}

const ProviderSetting: FC<Props> = ({ provider }) => {
  const [apiKey, setApiKey] = useState(provider.apiKey)
  const [apiHost, setApiHost] = useState(provider.apiHost)
  const [apiValid, setApiValid] = useState(false)
  const [apiChecking, setApiChecking] = useState(false)
  const { updateProvider, models } = useProvider(provider.id)

  const modelGroups = groupBy(models, 'group')

  useEffect(() => {
    setApiKey(provider.apiKey)
    setApiHost(provider.apiHost)
  }, [provider])

  const onUpdateApiKey = () => updateProvider({ ...provider, apiKey })
  const onUpdateApiHost = () => updateProvider({ ...provider, apiHost })
  const onManageModel = () => EditModelsPopup.show({ provider })
  const onAddModel = () => AddModelPopup.show({ title: 'Add Model', provider })

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
          <span>{provider.name}</span>
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
      <SettingSubtitle style={{ marginTop: 5 }}>API Key</SettingSubtitle>
      <Space.Compact style={{ width: '100%' }}>
        <Input
          value={apiKey}
          placeholder="API Key"
          onChange={(e) => setApiKey(e.target.value)}
          onBlur={onUpdateApiKey}
          spellCheck={false}
          disabled={apiKeyDisabled}
          autoFocus={provider.enabled && apiKey === ''}
        />
        {!apiKeyDisabled && (
          <Button type={apiValid ? 'primary' : 'default'} ghost={apiValid} onClick={onCheckApi}>
            {apiChecking ? <LoadingOutlined spin /> : apiValid ? <CheckOutlined /> : 'Check'}
          </Button>
        )}
      </Space.Compact>
      {apiKeyWebsite && (
        <HelpTextRow>
          <HelpText>Get API key from: </HelpText>
          <HelpLink target="_blank" href={apiKeyWebsite}>
            {provider.name}
          </HelpLink>
        </HelpTextRow>
      )}
      <SettingSubtitle>API Host</SettingSubtitle>
      <Input
        value={apiHost}
        placeholder="API Host"
        disabled={provider.isSystem}
        onChange={(e) => setApiHost(e.target.value)}
        onBlur={onUpdateApiHost}
      />
      <SettingSubtitle>Models</SettingSubtitle>
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
          <HelpText>Check </HelpText>
          <HelpLink target="_blank" href={docsWebsite}>
            {provider.name} Docs
          </HelpLink>
          <HelpText>and</HelpText>
          <HelpLink target="_blank" href={modelsWebsite}>
            Models
          </HelpLink>
          <HelpText>for more details</HelpText>
        </HelpTextRow>
      )}
      <Flex gap={10} style={{ marginTop: '10px' }}>
        <Button type="primary" onClick={onManageModel} icon={<EditOutlined />}>
          Manage
        </Button>
        <Button type="default" onClick={onAddModel} icon={<PlusOutlined />}>
          Add
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
