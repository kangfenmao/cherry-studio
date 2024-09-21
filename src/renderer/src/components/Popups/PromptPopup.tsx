import { Input, InputProps, Modal } from 'antd'
import { useState } from 'react'

import { Box } from '../Layout'
import { TopView } from '../TopView'

interface PromptPopupShowParams {
  title: string
  message: string
  defaultValue?: string
  inputPlaceholder?: string
  inputProps?: InputProps
}

interface Props extends PromptPopupShowParams {
  resolve: (value: string) => void
}

const PromptPopupContainer: React.FC<Props> = ({
  title,
  message,
  defaultValue = '',
  inputPlaceholder = '',
  inputProps = {},
  resolve
}) => {
  const [value, setValue] = useState(defaultValue)
  const [open, setOpen] = useState(true)

  const onOk = () => {
    setOpen(false)
  }

  const handleCancel = () => {
    setOpen(false)
  }

  const onClose = () => {
    resolve(value)
  }

  return (
    <Modal title={title} open={open} onOk={onOk} onCancel={handleCancel} afterClose={onClose} centered>
      <Box mb={8}>{message}</Box>
      <Input
        placeholder={inputPlaceholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        allowClear
        autoFocus
        onPressEnter={onOk}
        {...inputProps}
      />
    </Modal>
  )
}

export default class PromptPopup {
  static topviewId = 0
  static hide() {
    TopView.hide('PromptPopup')
  }
  static show(props: PromptPopupShowParams) {
    return new Promise<string>((resolve) => {
      TopView.show(
        <PromptPopupContainer
          {...props}
          resolve={(v) => {
            resolve(v)
            this.hide()
          }}
        />,
        'PromptPopup'
      )
    })
  }
}
