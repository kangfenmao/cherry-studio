import { useProviders } from '@renderer/hooks/useProvider'
import { Model } from '@renderer/types'
import { Flex, Tag } from 'antd'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

const MentionModelsInput: FC<{
  selectedModels: Model[]
  onRemoveModel: (model: Model) => void
}> = ({ selectedModels, onRemoveModel }) => {
  const { providers } = useProviders()
  const { t } = useTranslation()

  const getProviderName = (model: Model) => {
    const provider = providers.find((p) => p.models?.some((m) => m.id === model.id))
    return provider ? (provider.isSystem ? t(`provider.${provider.id}`) : provider.name) : ''
  }

  return (
    <Container gap="4px 0" wrap>
      {selectedModels.map((model) => (
        <Tag bordered={false} color="processing" key={model.id} closable onClose={() => onRemoveModel(model)}>
          @{model.name} ({getProviderName(model)})
        </Tag>
      ))}
    </Container>
  )
}

const Container = styled(Flex)`
  width: 100%;
  padding: 10px 15px 0;
`

export default MentionModelsInput
