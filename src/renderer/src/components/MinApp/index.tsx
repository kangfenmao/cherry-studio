import { CloseOutlined, ExportOutlined, ReloadOutlined } from '@ant-design/icons'
import store from '@renderer/store'
import { setMinappShow } from '@renderer/store/runtime'
import { Drawer } from 'antd'
import { useRef, useState } from 'react'
import styled from 'styled-components'

import { TopView } from '../TopView'

interface ShowParams {
  title: string
  url: string
}

interface Props extends ShowParams {
  resolve: (data: any) => void
}

const PopupContainer: React.FC<Props> = ({ title, url, resolve }) => {
  const [open, setOpen] = useState(true)
  const iframeRef = useRef<HTMLIFrameElement>(null)

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

  return (
    <Drawer
      title={title}
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
      <ButtonsGroup>
        <Button onClick={onReload}>
          <ReloadOutlined />
        </Button>
        <Button onClick={onOpenLink}>
          <ExportOutlined />
        </Button>
        <Button onClick={onClose}>
          <CloseOutlined />
        </Button>
      </ButtonsGroup>
    </Drawer>
  )
}

const Frame = styled.iframe`
  width: calc(100vw - var(--sidebar-width));
  height: calc(100vh - var(--navbar-height));
  border: none;
`

const ButtonsGroup = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  height: var(--navbar-height);
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 5px;
  padding: 0 10px;
`

const Button = styled.div`
  -webkit-app-region: no-drag;
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
