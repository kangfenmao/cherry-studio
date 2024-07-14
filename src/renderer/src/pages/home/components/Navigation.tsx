import { NavbarCenter } from '@renderer/components/app/Navbar'
import { colorPrimary } from '@renderer/config/antd'
import { useAssistant } from '@renderer/hooks/useAssistant'
import { useProviders } from '@renderer/hooks/useProvider'
import { Assistant } from '@renderer/types'
import { Button, Dropdown, MenuProps } from 'antd'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

interface Props {
  activeAssistant: Assistant
}

const Navigation: FC<Props> = ({ activeAssistant }) => {
  const { providers } = useProviders()
  const { model, setModel } = useAssistant(activeAssistant.id)
  const { t } = useTranslation()

  const items: MenuProps['items'] = providers
    .filter((p) => p.models.length > 0)
    .map((p) => ({
      key: p.id,
      label: t(`provider.${p.id}`),
      type: 'group',
      children: p.models.map((m) => ({
        key: m.id,
        label: m.name,
        style: m.id === model?.id ? { color: colorPrimary } : undefined,
        onClick: () => setModel(m)
      }))
    }))

  return (
    <NavbarCenter style={{ border: 'none', padding: '0 15px' }}>
      {activeAssistant?.name}
      <DropdownMenu menu={{ items, style: { maxHeight: '80vh', overflow: 'auto' } }} trigger={['click']}>
        <Button size="small" type="primary" ghost style={{ fontSize: '11px' }}>
          {model ? model.name : t('button.select_model')}
        </Button>
      </DropdownMenu>
    </NavbarCenter>
  )
}

const DropdownMenu = styled(Dropdown)`
  -webkit-app-region: none;
  margin-left: 10px;
`

export default Navigation
