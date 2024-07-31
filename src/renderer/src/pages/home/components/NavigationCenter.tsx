import { CodeSandboxOutlined } from '@ant-design/icons'
import { NavbarCenter } from '@renderer/components/app/Navbar'
import { isMac } from '@renderer/config/constant'
import { useAssistant } from '@renderer/hooks/useAssistant'
import { useProviders } from '@renderer/hooks/useProvider'
import { useShowAssistants } from '@renderer/hooks/useStore'
import { Assistant } from '@renderer/types'
import { Avatar, Button, Dropdown, MenuProps } from 'antd'
import { first, upperFirst } from 'lodash'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { NewButton } from '../HomePage'
import { getModelLogo } from '@renderer/config/provider'
import { removeLeadingEmoji } from '@renderer/utils'

interface Props {
  activeAssistant: Assistant
}

const NavigationCenter: FC<Props> = ({ activeAssistant }) => {
  const { assistant } = useAssistant(activeAssistant.id)
  const { model, setModel } = useAssistant(activeAssistant.id)
  const { providers } = useProviders()
  const { t } = useTranslation()
  const { showAssistants, toggleShowAssistants } = useShowAssistants()

  const items: MenuProps['items'] = providers
    .filter((p) => p.models.length > 0)
    .map((p) => ({
      key: p.id,
      label: p.isSystem ? t(`provider.${p.id}`) : p.name,
      type: 'group',
      children: p.models.map((m) => ({
        key: m?.id,
        label: upperFirst(m?.name),
        style: m?.id === model?.id ? { color: 'var(--color-primary)' } : undefined,
        icon: (
          <Avatar src={getModelLogo(m?.id || '')} size={24}>
            {first(m?.name)}
          </Avatar>
        ),
        onClick: () => m && setModel(m)
      }))
    }))

  return (
    <NavbarCenter style={{ paddingLeft: isMac ? 16 : 8 }}>
      {!showAssistants && (
        <NewButton onClick={toggleShowAssistants} style={{ marginRight: isMac ? 8 : 25 }}>
          <i className="iconfont icon-showsidebarhoriz" />
        </NewButton>
      )}
      <AssistantName>{removeLeadingEmoji(assistant?.name) || t('assistant.default.name')}</AssistantName>
      <DropdownMenu
        menu={{ items, style: { maxHeight: '80vh', overflow: 'auto' } }}
        trigger={['click']}
        overlayClassName="chat-nav-dropdown">
        <DropdownButton size="small" type="primary" ghost>
          <CodeSandboxOutlined />
          <ModelName>{model ? upperFirst(model.name) : t('button.select_model')}</ModelName>
        </DropdownButton>
      </DropdownMenu>
    </NavbarCenter>
  )
}

const DropdownMenu = styled(Dropdown)`
  -webkit-app-region: none;
  margin-left: 10px;
`

const AssistantName = styled.span`
  font-weight: bold;
  margin-left: 5px;
`

const DropdownButton = styled(Button)`
  font-size: 11px;
  border-radius: 15px;
  padding: 0 8px;
`

const ModelName = styled.span`
  margin-left: -2px;
  font-weight: bolder;
`

export default NavigationCenter
