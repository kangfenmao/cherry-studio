import CodeEditor from '@renderer/components/CodeEditor'
import { TopView } from '@renderer/components/TopView'
import { useProvider } from '@renderer/hooks/useProvider'
import { Provider } from '@renderer/types'
import { Modal, Space } from 'antd'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { SettingHelpText } from '..'

interface ShowParams {
  provider: Provider
}

interface Props extends ShowParams {
  resolve: (data: any) => void
}

const PopupContainer: React.FC<Props> = ({ provider, resolve }) => {
  const [open, setOpen] = useState(true)
  const { t } = useTranslation()
  const { updateProvider } = useProvider(provider.id)
  const [headerText, setHeaderText] = useState<string>(JSON.stringify(provider.extra_headers || {}, null, 2))

  const onUpdateHeaders = useCallback(() => {
    try {
      const headers = headerText.trim() ? JSON.parse(headerText) : {}
      updateProvider({ ...provider, extra_headers: headers })
      window.message.success({ content: t('message.save.success.title') })
    } catch (error) {
      window.message.error({ content: t('settings.provider.copilot.invalid_json') })
    }
  }, [headerText, provider, updateProvider, t])

  const onOk = () => {
    onUpdateHeaders()
    setOpen(false)
  }

  const onCancel = () => {
    setOpen(false)
  }

  const onClose = () => {
    resolve({})
  }

  CustomHeaderPopup.hide = onCancel

  return (
    <Modal
      title={t('settings.provider.copilot.custom_headers')}
      open={open}
      onOk={onOk}
      onCancel={onCancel}
      afterClose={onClose}
      transitionName="animation-move-down"
      centered>
      <Space.Compact direction="vertical" style={{ width: '100%', marginTop: 5 }}>
        <SettingHelpText>{t('settings.provider.copilot.headers_description')}</SettingHelpText>
        <CodeEditor
          value={headerText}
          language="json"
          onChange={(value) => setHeaderText(value)}
          placeholder={`{\n  "Header-Name": "Header-Value"\n}`}
          options={{
            lint: true,
            collapsible: false,
            wrappable: true,
            lineNumbers: true,
            foldGutter: true,
            highlightActiveLine: true,
            keymap: true
          }}
        />
      </Space.Compact>
    </Modal>
  )
}

const TopViewKey = 'CustomHeaderPopup'

export default class CustomHeaderPopup {
  static topviewId = 0
  static hide() {
    TopView.hide(TopViewKey)
  }
  static show(props: ShowParams) {
    return new Promise<any>((resolve) => {
      TopView.show(
        <PopupContainer
          {...props}
          resolve={(v) => {
            resolve(v)
            TopView.hide(TopViewKey)
          }}
        />,
        TopViewKey
      )
    })
  }
}
