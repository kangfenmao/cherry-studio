import { NavbarCenter } from '@renderer/components/app/Navbar'
import { useAssistant } from '@renderer/hooks/useAssistant'
import { useProviders } from '@renderer/hooks/useProvider'
import { Assistant } from '@renderer/types'
import { Button, Dropdown, MenuProps } from 'antd'
import { FC } from 'react'
import styled from 'styled-components'

interface Props {
  activeAssistant: Assistant
}

const Navigation: FC<Props> = ({ activeAssistant }) => {
  const providers = useProviders()
  const { model, setModel } = useAssistant(activeAssistant.id)

  const items: MenuProps['items'] = providers
    .filter((p) => p.models.length > 0)
    .map((p) => ({
      key: p.id,
      label: p.name,
      type: 'group',
      children: p.models.map((m) => ({
        key: m.id,
        label: m.name,
        onClick: () => setModel(m)
      }))
    }))

  return (
    <NavbarCenter style={{ border: 'none' }}>
      {activeAssistant?.name}
      <DropdownMenu menu={{ items }} trigger={['click']}>
        <Button size="small" type="primary" ghost style={{ fontSize: '11px' }}>
          {model ? model.name : 'Select Model'}
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
