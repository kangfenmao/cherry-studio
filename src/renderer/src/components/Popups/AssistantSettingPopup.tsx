import { Assistant } from '@renderer/types'
import { Input, Modal } from 'antd'
import TextArea from 'antd/es/input/TextArea'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Box } from '../Layout'
import { TopView } from '../TopView'

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
    <Modal
      title={assistant.name}
      open={open}
      onOk={onOk}
      onCancel={handleCancel}
      afterClose={onClose}
      transitionName="ant-move-down"
      maskTransitionName="ant-fade"
      centered>
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
        rows={10}
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
    TopView.hide('AssistantSettingPopup')
  }
  static show(props: AssistantSettingPopupShowParams) {
    return new Promise<Assistant>((resolve) => {
      TopView.show(
        <AssistantSettingPopupContainer
          {...props}
          resolve={(v) => {
            resolve(v)
            this.hide()
          }}
        />,
        'AssistantSettingPopup'
      )
    })
  }
}
