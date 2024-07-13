import { DragDropContext, Draggable, Droppable, DropResult } from '@hello-pangea/dnd'
import { useProviders, useSystemProviders } from '@renderer/hooks/useProvider'
import { getProviderLogo } from '@renderer/services/provider'
import { Provider } from '@renderer/types'
import { droppableReorder } from '@renderer/utils'
import { Avatar, Tag } from 'antd'
import { FC, useState } from 'react'
import styled from 'styled-components'
import ProviderSetting from './components/ProviderSetting'
import { useTranslation } from 'react-i18next'

const ProviderSettings: FC = () => {
  const providers = useSystemProviders()
  const { updateProviders } = useProviders()
  const [selectedProvider, setSelectedProvider] = useState<Provider>(providers[0])
  const { t } = useTranslation()

  const onDragEnd = (result: DropResult) => {
    if (result.destination) {
      const sourceIndex = result.source.index
      const destIndex = result.destination.index
      const reorderProviders = droppableReorder<Provider>(providers, sourceIndex, destIndex)
      updateProviders(reorderProviders)
    }
  }

  return (
    <Container>
      <ProviderListContainer>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="droppable">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {providers.map((provider, index) => (
                  <Draggable key={`draggable_${provider.id}_${index}`} draggableId={provider.id} index={index}>
                    {(provided) => (
                      <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                        <ProviderListItem
                          key={JSON.stringify(provider)}
                          className={provider.id === selectedProvider?.id ? 'active' : ''}
                          onClick={() => setSelectedProvider(provider)}>
                          <Avatar src={getProviderLogo(provider.id)} size={22} />
                          <ProviderItemName>{t(`provider.${provider.id}`)}</ProviderItemName>
                          {provider.enabled && (
                            <Tag color="green" style={{ marginLeft: 'auto' }}>
                              ON
                            </Tag>
                          )}
                        </ProviderListItem>
                      </div>
                    )}
                  </Draggable>
                ))}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </ProviderListContainer>
      <ProviderSetting provider={selectedProvider} key={JSON.stringify(selectedProvider)} />
    </Container>
  )
}

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
`

const ProviderListContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: var(--assistants-width);
  height: 100%;
  border-right: 0.5px solid var(--color-border);
  padding: 10px;
`

const ProviderListItem = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 6px 10px;
  margin-bottom: 5px;
  width: 100%;
  cursor: pointer;
  border-radius: 5px;
  font-size: 14px;
  transition: all 0.2s ease-in-out;
  &:hover {
    background: #135200;
  }
  &.active {
    background: #135200;
    font-weight: bold;
  }
`

const ProviderItemName = styled.div`
  margin-left: 10px;
  font-weight: bold;
`

export default ProviderSettings
