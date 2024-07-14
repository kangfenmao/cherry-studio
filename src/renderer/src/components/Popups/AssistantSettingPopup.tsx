import { Input, Modal } from 'antd'
import { useState } from 'react'
import { TopView } from '../TopView'
import { Box } from '../Layout'
import { Assistant } from '@renderer/types'
import TextArea from 'antd/es/input/TextArea'
import { useTranslation } from 'react-i18next'

interface AssistantSettingPopupShowParams {
  assistant: Assistant
}

interface Props extends AssistantSettingPopupShowParams {
  resolve: (assistant: Assistant) => void
}

const AssistantSettingPopupContainer: React.FC<Props> = ({ assistant, resolve }) => {
  const [name, setName] = useState(assistant.name)
  const [prompt, setPrompt] = useState(assistant.prompt)
  const [open, setOpen] = useState(true)
  const { t } = useTranslation()

  const onOk = () => {
    setOpen(false)
  }

  const handleCancel = () => {
    setOpen(false)
  }

  const onClose = () => {
    resolve({ ...assistant, name, prompt })
  }

  return (
    <Modal title={assistant.name} open={open} onOk={onOk} onCancel={handleCancel} afterClose={onClose}>
      <Box mb={8}>{t('common.name')}</Box>
      <Input
        placeholder={t('common.assistant') + t('common.name')}
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <Box mt={8} mb={8}>
        {t('common.prompt')}
      </Box>
      <TextArea
        rows={4}
        placeholder={t('common.assistant') + t('common.prompt')}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
    </Modal>
  )
}

export default class AssistantSettingPopup {
  static topviewId = 0
  static hide() {
    TopView.hide(this.topviewId)
  }
  static show(props: AssistantSettingPopupShowParams) {
    return new Promise<Assistant>((resolve) => {
      this.topviewId = TopView.show(
        <AssistantSettingPopupContainer
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
