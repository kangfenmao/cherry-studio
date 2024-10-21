import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons'
import { DragDropContext, Draggable, Droppable, DropResult } from '@hello-pangea/dnd'
import { getProviderLogo } from '@renderer/config/providers'
import { useAllProviders, useProviders } from '@renderer/hooks/useProvider'
import { Provider } from '@renderer/types'
import { droppableReorder, generateColorFromChar, getFirstCharacter, uuid } from '@renderer/utils'
import { Avatar, Button, Dropdown, MenuProps, Tag } from 'antd'
import { FC, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import AddProviderPopup from './AddProviderPopup'
import ProviderSetting from './ProviderSetting'

const ProvidersList: FC = () => {
  const providers = useAllProviders()
  const { updateProviders, addProvider, removeProvider, updateProvider } = useProviders()
  const [selectedProvider, setSelectedProvider] = useState<Provider>(providers[0])
  const { t } = useTranslation()
  const [dragging, setDragging] = useState(false)

  const onDragEnd = (result: DropResult) => {
    setDragging(false)
    if (result.destination) {
      const sourceIndex = result.source.index
      const destIndex = result.destination.index
      const reorderProviders = droppableReorder<Provider>(providers, sourceIndex, destIndex)
      updateProviders(reorderProviders)
    }
  }

  const onAddProvider = async () => {
    const prividerName = await AddProviderPopup.show()

    if (!prividerName) {
      return
    }

    const provider = {
      id: uuid(),
      name: prividerName,
      apiKey: '',
      apiHost: '',
      models: [],
      enabled: true,
      isSystem: false
    } as Provider
    addProvider(provider)
    setSelectedProvider(provider)
  }

  const getDropdownMenus = (provider: Provider): MenuProps['items'] => {
    return [
      {
        label: t('common.edit'),
        key: 'edit',
        icon: <EditOutlined />,
        async onClick() {
          const name = await AddProviderPopup.show(provider)
          name && updateProvider({ ...provider, name })
        }
      },
      {
        label: t('common.delete'),
        key: 'delete',
        icon: <DeleteOutlined />,
        danger: true,
        async onClick() {
          window.modal.confirm({
            title: t('settings.provider.delete.title'),
            content: t('settings.provider.delete.content'),
            okButtonProps: { danger: true },
            okText: t('common.delete'),
            centered: true,
            onOk: () => {
              setSelectedProvider(providers.filter((p) => p.isSystem)[0])
              removeProvider(provider)
            }
          })
        }
      }
    ]
  }

  return (
    <Container>
      <ProviderListContainer>
        <ProviderList>
          <DragDropContext onDragStart={() => setDragging(true)} onDragEnd={onDragEnd}>
            <Droppable droppableId="droppable">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {providers.map((provider, index) => (
                    <Draggable key={`draggable_${provider.id}_${index}`} draggableId={provider.id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={{ ...provided.draggableProps.style, marginBottom: 5 }}>
                          <Dropdown
                            menu={{ items: provider.isSystem ? [] : getDropdownMenus(provider) }}
                            trigger={['contextMenu']}>
                            <ProviderListItem
                              key={JSON.stringify(provider)}
                              className={provider.id === selectedProvider?.id ? 'active' : ''}
                              onClick={() => setSelectedProvider(provider)}>
                              {provider.isSystem && (
                                <ProviderLogo shape="square" src={getProviderLogo(provider.id)} size={25} />
                              )}
                              {!provider.isSystem && (
                                <ProviderLogo
                                  size={25}
                                  shape="square"
                                  style={{ backgroundColor: generateColorFromChar(provider.name), minWidth: 25 }}>
                                  {getFirstCharacter(provider.name)}
                                </ProviderLogo>
                              )}
                              <ProviderItemName className="text-nowrap">
                                {provider.isSystem ? t(`provider.${provider.id}`) : provider.name}
                              </ProviderItemName>
                              {provider.enabled && (
                                <Tag color="green" style={{ marginLeft: 'auto' }}>
                                  ON
                                </Tag>
                              )}
                            </ProviderListItem>
                          </Dropdown>
                        </div>
                      )}
                    </Draggable>
                  ))}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </ProviderList>
        {!dragging && (
          <AddButtonWrapper>
            <Button type="dashed" style={{ width: '100%' }} icon={<PlusOutlined />} onClick={onAddProvider} />
          </AddButtonWrapper>
        )}
      </ProviderListContainer>
      <ProviderSetting provider={selectedProvider} key={JSON.stringify(selectedProvider)} />
    </Container>
  )
}

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`

const ProviderListContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: var(--assistants-width);
  height: calc(100vh - var(--navbar-height));
  border-right: 0.5px solid var(--color-border);
  overflow-y: auto;
`

const ProviderList = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  height: calc(100vh - var(--navbar-height));
  overflow: auto;
  padding: 8px;
`

const ProviderListItem = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 5px 8px;
  width: 100%;
  cursor: pointer;
  border-radius: 5px;
  font-size: 14px;
  transition: all 0.2s ease-in-out;
  &:hover {
    background: var(--color-background-soft);
  }
  &.active {
    background: var(--color-background-mute);
    font-weight: bold !important;
  }
`

const ProviderLogo = styled(Avatar)`
  border: 0.5px solid var(--color-border);
`

const ProviderItemName = styled.div`
  margin-left: 10px;
  font-weight: 500;
  font-family: Ubuntu;
`

const AddButtonWrapper = styled.div`
  height: 50px;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 10px 8px;
`

export default ProvidersList
