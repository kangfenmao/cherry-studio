import { Modal } from 'antd'
import { useState } from 'react'
import { TopView } from '../TopView'
import { Box } from '../Layout'

interface ShowParams {
  title: string
}

interface Props extends ShowParams {
  resolve: (data: any) => void
}

const PopupContainer: React.FC<Props> = ({ title, resolve }) => {
  const [open, setOpen] = useState(true)

  const onOk = () => {
    setOpen(false)
  }

  const onCancel = () => {
    setOpen(false)
  }

  const onClose = () => {
    resolve({})
  }

  return (
    <Modal title={title} open={open} onOk={onOk} onCancel={onCancel} afterClose={onClose}>
      <Box mb={8}>Name</Box>
    </Modal>
  )
}

export default class TemplatePopup {
  static topviewId = 0
  static hide() {
    TopView.hide(this.topviewId)
  }
  static show(props: ShowParams) {
    return new Promise<any>((resolve) => {
      this.topviewId = TopView.show(
        <PopupContainer
          {...props}
          resolve={(v) => {
            resolve(v)
            this.hide()
          }}
        />
      )
    })
  }
}
