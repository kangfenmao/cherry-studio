import { Center } from '@renderer/components/Layout'
import { getAllMinApps } from '@renderer/config/minapps'
import { useSettings } from '@renderer/hooks/useSettings'
import App from '@renderer/pages/apps/App'
import { Popover } from 'antd'
import { Empty } from 'antd'
import { isEmpty } from 'lodash'
import { FC, useMemo, useState } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import styled from 'styled-components'

import Scrollbar from '../Scrollbar'

interface Props {
  children: React.ReactNode
}

const AppStorePopover: FC<Props> = ({ children }) => {
  const [open, setOpen] = useState(false)
  const { miniAppIcons } = useSettings()
  const allApps = useMemo(() => getAllMinApps(), [])

  // 只显示可见的小程序
  const visibleApps = useMemo(() => {
    if (!miniAppIcons?.visible) return allApps
    return allApps.filter((app) => miniAppIcons.visible.includes(app.id))
  }, [allApps, miniAppIcons?.visible])

  useHotkeys('esc', () => {
    setOpen(false)
  })

  const handleClose = () => {
    setOpen(false)
  }

  const content = (
    <PopoverContent>
      <AppsContainer>
        {visibleApps.map((app) => (
          <App key={app.id} app={app} onClick={handleClose} size={50} />
        ))}
        {isEmpty(visibleApps) && (
          <Center>
            <Empty />
          </Center>
        )}
      </AppsContainer>
    </PopoverContent>
  )

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      content={content}
      trigger="click"
      placement="bottomRight"
      styles={{ body: { padding: 25 } }}>
      {children}
    </Popover>
  )
}

const PopoverContent = styled(Scrollbar)``

const AppsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(6, minmax(90px, 1fr));
  gap: 18px;
`

export default AppStorePopover
