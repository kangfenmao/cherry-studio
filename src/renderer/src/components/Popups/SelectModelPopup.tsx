import { SearchOutlined } from '@ant-design/icons'
import VisionIcon from '@renderer/components/Icons/VisionIcon'
import { TopView } from '@renderer/components/TopView'
import { getModelLogo, isVisionModel } from '@renderer/config/models'
import { useProviders } from '@renderer/hooks/useProvider'
import { getModelUniqId } from '@renderer/services/model'
import { Model } from '@renderer/types'
import { Avatar, Divider, Empty, Input, InputRef, Menu, MenuProps, Modal } from 'antd'
import { first, reverse, sortBy } from 'lodash'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { HStack } from '../Layout'

type MenuItem = Required<MenuProps>['items'][number]

interface Props {
  model?: Model
}

interface PopupContainerProps extends Props {
  resolve: (value: Model | undefined) => void
}

const PopupContainer: React.FC<PopupContainerProps> = ({ model, resolve }) => {
  const [open, setOpen] = useState(true)
  const { t } = useTranslation()
  const [searchText, setSearchText] = useState('')
  const inputRef = useRef<InputRef>(null)
  const { providers } = useProviders()

  const filteredItems: MenuItem[] = providers
    .filter((p) => p.models && p.models.length > 0)
    .map((p) => ({
      key: p.id,
      label: p.isSystem ? t(`provider.${p.id}`) : p.name,
      type: 'group',
      children: reverse(sortBy(p.models, 'name'))
        .filter((m) =>
          [m.name + m.provider + t('provider.' + p.id)].join('').toLowerCase().includes(searchText.toLowerCase())
        )
        .map((m) => ({
          key: getModelUniqId(m),
          label: (
            <ModelItem>
              {m?.name} {isVisionModel(m) && <VisionIcon />}
            </ModelItem>
          ),
          icon: (
            <Avatar src={getModelLogo(m?.id || '')} size={24}>
              {first(m?.name)}
            </Avatar>
          ),
          onClick: () => {
            resolve(m)
            setOpen(false)
          }
        }))
    }))
    .filter((item) => item.children && item.children.length > 0) as MenuItem[]

  const onCancel = () => {
    setOpen(false)
  }

  const onClose = async () => {
    resolve(undefined)
    SelectModelPopup.hide()
  }

  useEffect(() => {
    open && setTimeout(() => inputRef.current?.focus(), 0)
  }, [open])

  return (
    <Modal
      centered
      open={open}
      onCancel={onCancel}
      afterClose={onClose}
      transitionName="ant-move-down"
      styles={{ content: { borderRadius: 20, padding: 0, overflow: 'hidden', paddingBottom: 20 } }}
      closeIcon={null}
      footer={null}>
      <HStack style={{ padding: '0 12px', marginTop: 5 }}>
        <Input
          prefix={
            <SearchIcon>
              <SearchOutlined />
            </SearchIcon>
          }
          ref={inputRef}
          placeholder={t('model.search')}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
          autoFocus
          style={{ paddingLeft: 0 }}
          bordered={false}
          size="middle"
        />
      </HStack>
      <Divider style={{ margin: 0, borderBlockStartWidth: 0.5 }} />
      <Container>
        {filteredItems.length > 0 ? (
          <StyledMenu
            items={filteredItems}
            selectedKeys={model ? [getModelUniqId(model)] : []}
            mode="inline"
            inlineIndent={6}
          />
        ) : (
          <EmptyState>
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
          </EmptyState>
        )}
      </Container>
    </Modal>
  )
}

const Container = styled.div`
  height: 50vh;
  margin-top: 10px;
  overflow-y: auto;
`

const StyledMenu = styled(Menu)`
  background-color: transparent;
  padding: 5px;
  margin-top: -10px;
  max-height: calc(60vh - 50px);

  .ant-menu-item-group-title {
    padding: 5px 10px 0;
    font-size: 12px;
  }

  .ant-menu-item {
    height: 36px;
    line-height: 36px;
  }
`

const ModelItem = styled.div`
  display: flex;
  align-items: center;
  font-size: 14px;
`

const EmptyState = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
`

const SearchIcon = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  background-color: var(--color-background-soft);
  margin-right: 2px;
`

export default class SelectModelPopup {
  static topviewId = 0
  static hide() {
    TopView.hide('SelectModelPopup')
  }
  static show(params: Props) {
    return new Promise<Model | undefined>((resolve) => {
      TopView.show(<PopupContainer {...params} resolve={resolve} />, 'SelectModelPopup')
    })
  }
}
