import { NavbarCenter } from '@renderer/components/app/Navbar'
import { colorPrimary } from '@renderer/config/antd'
import { useAssistant } from '@renderer/hooks/useAssistant'
import { useProviders } from '@renderer/hooks/useProvider'
import { Assistant } from '@renderer/types'
import { Button, Dropdown, MenuProps } from 'antd'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { NewButton } from '../HomePage'
import { useShowAssistants } from '@renderer/hooks/useStore'
import { isMac } from '@renderer/config/constant'
import { upperFirst } from 'lodash'

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
        key: m.id,
        label: m.name,
        style: m.id === model?.id ? { color: colorPrimary } : undefined,
        onClick: () => setModel(m)
      }))
    }))

  return (
    <NavbarCenter style={{ paddingLeft: isMac ? 16 : 8 }}>
      {!showAssistants && (
        <NewButton onClick={toggleShowAssistants} style={{ marginRight: 8 }}>
          <i className="iconfont icon-showsidebarhoriz" />
        </NewButton>
      )}
      <AssistantName>{assistant?.name}</AssistantName>
      <DropdownMenu menu={{ items, style: { maxHeight: '80vh', overflow: 'auto' } }} trigger={['click']}>
        <DropdownButton size="small" type="primary" ghost>
          {model ? upperFirst(model.name) : t('button.select_model')}
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
  font-size: 10px;
  border-radius: 15px;
  padding: 0 8px;
`

export default NavigationCenter
