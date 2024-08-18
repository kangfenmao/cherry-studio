import { CloseOutlined, ExportOutlined, ReloadOutlined } from '@ant-design/icons'
import { isMac, isWindows } from '@renderer/config/constant'
import { useBridge } from '@renderer/hooks/useBridge'
import store from '@renderer/store'
import { setMinappShow } from '@renderer/store/runtime'
import { Drawer } from 'antd'
import { useRef, useState } from 'react'
import styled from 'styled-components'

import { TopView } from '../TopView'

interface ShowParams {
  title?: string
  url: string
}

interface Props extends ShowParams {
  resolve: (data: any) => void
}

const PopupContainer: React.FC<Props> = ({ title, url, resolve }) => {
  const [open, setOpen] = useState(true)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useBridge()

  const canOpenExternalLink = url.startsWith('http://') || url.startsWith('https://')

  const onClose = () => {
    setOpen(false)
    setTimeout(() => resolve({}), 300)
  }

  const onReload = () => {
    if (iframeRef.current) {
      iframeRef.current.src = url
    }
  }

  const onOpenLink = () => {
    window.api.openWebsite(url)
  }

  const Title = () => {
    return (
      <TitleContainer style={{ justifyContent: isWindows ? 'flex-start' : 'space-between' }}>
        <TitleText>{title}</TitleText>
        <ButtonsGroup>
          <Button onClick={onReload}>
            <ReloadOutlined />
          </Button>
          {canOpenExternalLink && (
            <Button onClick={onOpenLink}>
              <ExportOutlined />
            </Button>
          )}
          <Button onClick={onClose}>
            <CloseOutlined />
          </Button>
        </ButtonsGroup>
      </TitleContainer>
    )
  }

  return (
    <Drawer
      title={<Title />}
      placement="bottom"
      onClose={onClose}
      open={open}
      mask={true}
      rootClassName="minapp-drawer"
      maskClassName="minapp-mask"
      height={'100%'}
      maskClosable={false}
      closeIcon={null}
      style={{ marginLeft: 'var(--sidebar-width)' }}>
      <Frame src={url} ref={iframeRef} />
    </Drawer>
  )
}

const Frame = styled.iframe`
  width: calc(100vw - var(--sidebar-width));
  height: calc(100vh - var(--navbar-height));
  border: none;
`

const TitleContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding-left: ${isMac ? '20px' : '15px'};
  padding-right: 10px;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`

const TitleText = styled.div`
  font-weight: bold;
  font-size: 14px;
  color: var(--color-text-1);
  margin-right: 10px;
  user-select: none;
`

const ButtonsGroup = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 5px;
  -webkit-app-region: no-drag;
`

const Button = styled.div`
  cursor: pointer;
  width: 30px;
  height: 30px;
  border-radius: 5px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  color: var(--color-text-2);
  transition: all 0.2s ease;
  font-size: 14px;
  &:hover {
    color: var(--color-text-1);
    background-color: var(--color-background-mute);
  }
`

export default class MinApp {
  static topviewId = 0
  static close() {
    TopView.hide('MinApp')
    store.dispatch(setMinappShow(false))
  }
  static start(props: ShowParams) {
    store.dispatch(setMinappShow(true))
    return new Promise<any>((resolve) => {
      TopView.show(
        <PopupContainer
          {...props}
          resolve={(v) => {
            resolve(v)
            this.close()
          }}
        />,
        'MinApp'
      )
    })
  }
}
