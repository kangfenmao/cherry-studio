import MinApp from '@renderer/components/MinApp'
import { useAppDispatch, useAppSelector } from '@renderer/store'
import { setMiniAppIcons } from '@renderer/store/settings'
import { MinAppType } from '@renderer/types'
import type { MenuProps } from 'antd'
import { Dropdown } from 'antd'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'


interface Props {
  app: MinAppType
  onClick?: () => void
  size?: number
}

const App: FC<Props> = ({ app, onClick, size = 60 }) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const { miniAppIcons } = useAppSelector((state) => state.settings)
  const isPinned = miniAppIcons?.pinned.includes(app.id)

  const handleClick = () => {
    MinApp.start(app)
    onClick?.()
  }

  const menuItems: MenuProps['items'] = [
    {
      key: 'togglePin',
      label: isPinned ? t('minapp.sidebar.remove.title') : t('minapp.sidebar.add.title'),
      onClick: () => {
        const newPinned = isPinned
          ? miniAppIcons.pinned.filter((id) => id !== app.id)
          : [...(miniAppIcons.pinned || []), app.id]

        dispatch(
          setMiniAppIcons({
            ...miniAppIcons,
            pinned: newPinned
          })
        )
      }
    }
  ]

  return (
    <Dropdown menu={{ items: menuItems }} trigger={['contextMenu']}>
      <Container onClick={handleClick}>
        <AppIcon
          src={app.logo}
          style={{
            border: app.bodered ? '0.5px solid var(--color-border)' : 'none',
            width: `${size}px`,
            height: `${size}px`
          }}
        />
        <AppTitle>{app.name}</AppTitle>
      </Container>
    </Dropdown>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  overflow: hidden;
`

const AppIcon = styled.img`
  border-radius: 16px;
  user-select: none;
  -webkit-user-drag: none;
`

const AppTitle = styled.div`
  font-size: 12px;
  margin-top: 5px;
  color: var(--color-text-soft);
  text-align: center;
  user-select: none;
  white-space: nowrap;
`

export default App
