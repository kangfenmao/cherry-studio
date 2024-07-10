import { Avatar, Button, Empty, Modal } from 'antd'
import { useState } from 'react'
import { TopView } from '../../../components/TopView'
import { Model, Provider } from '@renderer/types'
import { groupBy, isEmpty, uniqBy } from 'lodash'
import styled from 'styled-components'
import { MinusOutlined, PlusOutlined } from '@ant-design/icons'
import { useProvider } from '@renderer/hooks/useProvider'
import { SYSTEM_MODELS } from '@renderer/config/models'
import { getModelLogo } from '@renderer/services/provider'

interface ShowParams {
  provider: Provider
}

interface Props extends ShowParams {
  resolve: (data: any) => void
}

const PopupContainer: React.FC<Props> = ({ provider: _provider, resolve }) => {
  const [open, setOpen] = useState(true)
  const { provider, models, addModel, removeModel } = useProvider(_provider.id)

  const systemModels = SYSTEM_MODELS[_provider.id] || []
  const allModels = uniqBy([...systemModels, ...models], 'id')
  const systemModelGroups = groupBy(allModels, 'group')

  const onOk = () => {
    setOpen(false)
  }

  const onCancel = () => {
    setOpen(false)
  }

  const onClose = () => {
    resolve({})
  }

  const onAddModel = (model: Model) => {
    addModel(model)
  }

  const onRemoveModel = (model: Model) => {
    removeModel(model)
  }

  return (
    <Modal
      title={String(provider.name + ' Models').toUpperCase()}
      open={open}
      onOk={onOk}
      onCancel={onCancel}
      afterClose={onClose}
      footer={null}
      width="600px"
      styles={{
        content: { padding: 0 },
        header: { padding: 22, paddingBottom: 15 }
      }}>
      <ListContainer>
        {Object.keys(systemModelGroups).map((group) => (
          <div key={group}>
            <ListHeader key={group}>{group}</ListHeader>
            {systemModelGroups[group].map((model) => {
              const hasModel = provider.models.find((m) => m.id === model.id)
              return (
                <ListItem key={model.id}>
                  <ListItemHeader>
                    <Avatar src={getModelLogo(model.id)} size={24} />
                    <ListItemName>{model.name}</ListItemName>
                  </ListItemHeader>
                  {hasModel ? (
                    <Button type="default" onClick={() => onRemoveModel(model)} icon={<MinusOutlined />} />
                  ) : (
                    <Button type="primary" onClick={() => onAddModel(model)} icon={<PlusOutlined />} />
                  )}
                </ListItem>
              )
            })}
          </div>
        ))}
        {isEmpty(allModels) && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No models" />}
      </ListContainer>
    </Modal>
  )
}

const ListContainer = styled.div`
  max-height: 70vh;
  overflow-y: scroll;
  padding-bottom: 20px;
`

const ListHeader = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  background-color: var(--color-background-soft);
  padding: 8px 22px;
  color: #ffffff50;
`

const ListItem = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 10px 22px;
`

const ListItemHeader = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  margin-right: 10px;
  height: 22px;
`

const ListItemName = styled.div`
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  margin-left: 6px;
`

export default class ModelListPopup {
  static topviewId = 0
  static hide() {
    TopView.hide(this.topviewId)
  }
  static show(props: ShowParams) {
    return new Promise<any>((resolve) => {
      this.topviewId = TopView.show(
        <PopupContainer
          {...props}
          resolve={(v) => {
            resolve(v)
            this.hide()
          }}
        />
      )
    })
  }
}
