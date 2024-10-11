import { useTheme } from '@renderer/context/ThemeProvider'
import { Assistant } from '@renderer/types'
import { Menu, Modal } from 'antd'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { HStack } from '../Layout'
import { TopView } from '../TopView'
import AssistantModelSettings from './AssistantModelSettings'
import AssistantPromptSettings from './AssistantPromptSettings'

interface AssistantSettingPopupShowParams {
  assistant: Assistant
}

interface Props extends AssistantSettingPopupShowParams {
  resolve: (assistant: Assistant) => void
}

const AssistantSettingPopupContainer: React.FC<Props> = ({ assistant, resolve }) => {
  const [open, setOpen] = useState(true)
  const { t } = useTranslation()
  const [menu, setMenu] = useState('prompt')
  const { theme } = useTheme()

  const onOk = () => {
    setOpen(false)
  }

  const handleCancel = () => {
    setOpen(false)
  }

  const onClose = () => {
    resolve(assistant)
  }

  const items = [
    {
      key: 'prompt',
      label: t('assistants.prompt_settings')
    },
    {
      key: 'model',
      label: t('assistants.model_settings')
    }
  ]

  return (
    <StyledModal
      open={open}
      onOk={onOk}
      onCancel={handleCancel}
      afterClose={onClose}
      transitionName="ant-move-down"
      maskTransitionName="ant-fade"
      footer={null}
      title={assistant.name}
      styles={{
        content: {
          padding: 0,
          overflow: 'hidden',
          border: '1px solid var(--color-border)',
          background: 'var(--color-background)'
        },
        header: { padding: '10px 15px', borderBottom: '0.5px solid var(--color-border)', margin: 0 },
        mask: { background: theme === 'light' ? 'rgba(255,255,255, 0.8)' : 'rgba(0,0,0, 0.8)' }
      }}
      width="70vw"
      height="80vh"
      centered>
      <HStack>
        <LeftMenu>
          <Menu
            style={{ width: 220, padding: 5, background: 'transparent' }}
            defaultSelectedKeys={['prompt']}
            mode="vertical"
            items={items}
            onSelect={({ key }) => setMenu(key as string)}
          />
        </LeftMenu>
        <Settings>
          {menu === 'prompt' && <AssistantPromptSettings assistant={assistant} onOk={onOk} />}
          {menu === 'model' && <AssistantModelSettings assistant={assistant} />}
        </Settings>
      </HStack>
    </StyledModal>
  )
}

const LeftMenu = styled.div`
  background-color: var(--color-background);
  height: calc(80vh - 20px);
  border-right: 0.5px solid var(--color-border);
`

const Settings = styled.div`
  flex: 1;
  padding: 10px 20px;
  height: calc(80vh - 20px);
  overflow-y: scroll;
`

const StyledModal = styled(Modal)`
  .ant-modal-title {
    font-size: 14px;
  }
  .ant-modal-close {
    top: 4px;
  }
  .ant-menu-item {
    height: 36px;
    border-radius: 4px;
    color: var(--color-text-2);
    display: flex;
    align-items: center;
    .ant-menu-title-content {
      line-height: 36px;
    }
  }
  .ant-menu-item-active {
    background-color: var(--color-background-soft) !important;
    transition: none;
  }
  .ant-menu-item-selected {
    background-color: var(--color-background-soft);
    .ant-menu-title-content {
      color: var(--color-text-1);
      font-weight: 500;
    }
  }
`

export default class AssistantSettingPopup {
  static topviewId = 0
  static hide() {
    TopView.hide('AssistantSettingPopup')
  }
  static show(props: AssistantSettingPopupShowParams) {
    return new Promise<Assistant>((resolve) => {
      TopView.show(
        <AssistantSettingPopupContainer
          {...props}
          resolve={(v) => {
            resolve(v)
            this.hide()
          }}
        />,
        'AssistantSettingPopup'
      )
    })
  }
}
