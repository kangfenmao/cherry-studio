import { TranslationOutlined } from '@ant-design/icons'
import { useDefaultModel } from '@renderer/hooks/useAssistant'
import { fetchTranslate } from '@renderer/services/ApiService'
import { getDefaultTopic, getDefaultTranslateAssistant } from '@renderer/services/AssistantService'
import { getUserMessage } from '@renderer/services/MessagesService'
import { Button } from 'antd'
import { FC, useState } from 'react'
import { useTranslation } from 'react-i18next'

interface Props {
  text?: string
  onTranslated: (translatedText: string) => void
  disabled?: boolean
  style?: React.CSSProperties
}

const TranslateButton: FC<Props> = ({ text, onTranslated, disabled, style }) => {
  const { t } = useTranslation()
  const { translateModel } = useDefaultModel()
  const [isTranslating, setIsTranslating] = useState(false)

  const handleTranslate = async () => {
    if (!text?.trim()) return

    if (!translateModel) {
      window.message.error({
        content: t('translate.error.not_configured'),
        key: 'translate-message'
      })
      return
    }

    // 先复制原文到剪贴板
    await navigator.clipboard.writeText(text)

    setIsTranslating(true)
    try {
      const assistant = getDefaultTranslateAssistant('english', text)
      const message = getUserMessage({
        assistant,
        topic: getDefaultTopic('default'),
        type: 'text'
      })

      const translatedText = await fetchTranslate({ message, assistant })
      onTranslated(translatedText)
    } catch (error) {
      console.error('Translation failed:', error)
      window.message.error({
        content: t('translate.error.failed'),
        key: 'translate-message'
      })
    } finally {
      setIsTranslating(false)
    }
  }

  return (
    <Button
      icon={<TranslationOutlined style={{ fontSize: 14 }} />}
      onClick={handleTranslate}
      disabled={disabled || isTranslating}
      loading={isTranslating}
      style={style}
      size="small"
    />
  )
}

export default TranslateButton
