import { TopView } from '@renderer/components/TopView'
import { Provider } from '@renderer/types'
import { Input, Modal } from 'antd'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

interface Props {
  provider?: Provider
  resolve: (name: string) => void
}

const PopupContainer: React.FC<Props> = ({ provider, resolve }) => {
  const [open, setOpen] = useState(true)
  const [name, setName] = useState(provider?.name || '')
  const { t } = useTranslation()

  const onOk = () => {
    setOpen(false)
    resolve(name)
  }

  const onCancel = () => {
    setOpen(false)
    resolve('')
  }

  const onClose = () => {
    resolve(name)
  }

  const buttonDisabled = name.length === 0

  return (
    <Modal
      open={open}
      onOk={onOk}
      onCancel={onCancel}
      afterClose={onClose}
      width={360}
      closable={false}
      centered
      title={t('settings.provider.edit.name')}
      okButtonProps={{ disabled: buttonDisabled }}>
      <Input
        value={name}
        onChange={(e) => setName(e.target.value.trim())}
        placeholder={t('settings.provider.edit.name.placeholder')}
        onKeyDown={(e) => e.key === 'Enter' && onOk()}
        maxLength={32}
      />
    </Modal>
  )
}

export default class AddProviderPopup {
  static topviewId = 0
  static hide() {
    TopView.hide('AddProviderPopup')
  }
  static show(provider?: Provider) {
    return new Promise<string>((resolve) => {
      TopView.show(
        <PopupContainer
          provider={provider}
          resolve={(v) => {
            resolve(v)
            this.hide()
          }}
        />,
        'AddProviderPopup'
      )
    })
  }
}
