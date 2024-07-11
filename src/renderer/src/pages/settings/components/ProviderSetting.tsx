import { Provider } from '@renderer/types'
import { FC, useEffect, useState } from 'react'
import styled from 'styled-components'
import { Avatar, Button, Card, Divider, Flex, Input, Switch } from 'antd'
import { useProvider } from '@renderer/hooks/useProvider'
import { groupBy } from 'lodash'
import { SettingContainer, SettingSubtitle, SettingTitle } from './SettingComponent'
import { getModelLogo } from '@renderer/services/provider'
import { EditOutlined, PlusOutlined } from '@ant-design/icons'
import ModalAddPopup from './ModelAddPopup'
import ModelListPopup from './ModelListPopup'

interface Props {
  provider: Provider
}

const ProviderSetting: FC<Props> = ({ provider }) => {
  const [apiKey, setApiKey] = useState(provider.apiKey)
  const [apiHost, setApiHost] = useState(provider.apiHost)
  const { updateProvider, models } = useProvider(provider.id)

  const modelGroups = groupBy(models, 'group')

  useEffect(() => {
    setApiKey(provider.apiKey)
    setApiHost(provider.apiHost)
  }, [provider])

  const onUpdateApiKey = () => {
    updateProvider({ ...provider, apiKey })
  }

  const onUpdateApiHost = () => {
    updateProvider({ ...provider, apiHost })
  }

  const onManageModel = () => {
    ModelListPopup.show({ provider })
  }

  const onAddModel = () => {
    ModalAddPopup.show({ title: 'Add Model', provider })
  }

  return (
    <SettingContainer>
      <SettingTitle>
        <span>{provider.name}</span>
        <Switch
          defaultValue={provider.enabled}
          key={provider.id}
          onChange={(enabled) => updateProvider({ ...provider, apiKey, apiHost, enabled })}
        />
      </SettingTitle>
      <Divider style={{ width: '100%', margin: '10px 0' }} />
      <SettingSubtitle>API Key</SettingSubtitle>
      <Input
        value={apiKey}
        placeholder="API Key"
        onChange={(e) => setApiKey(e.target.value)}
        onBlur={onUpdateApiKey}
        spellCheck={false}
      />
      <SettingSubtitle>API Host</SettingSubtitle>
      <Input
        value={apiHost}
        placeholder="API Host"
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

export default ProviderSetting
