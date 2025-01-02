import Scrollbar from '@renderer/components/Scrollbar'
import db from '@renderer/databases'
import { useDefaultModel } from '@renderer/hooks/useAssistant'
import { fetchTranslate } from '@renderer/services/ApiService'
import { getDefaultTranslateAssistant } from '@renderer/services/AssistantService'
import { Assistant, Message } from '@renderer/types'
import { uuid } from '@renderer/utils'
import { Select, Space } from 'antd'
import { FC, useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

interface Props {
  text: string
}

const Translate: FC<Props> = ({ text }) => {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')
  const [targetLanguage, setTargetLanguage] = useState('chinese')
  const { translateModel } = useDefaultModel()

  const languageOptions = [
    {
      value: 'english',
      label: t('languages.english'),
      emoji: '🇬🇧'
    },
    {
      value: 'chinese',
      label: t('languages.chinese'),
      emoji: '🇨🇳'
    },
    {
      value: 'chinese-traditional',
      label: t('languages.chinese-traditional'),
      emoji: '🇭🇰'
    },
    {
      value: 'japanese',
      label: t('languages.japanese'),
      emoji: '🇯🇵'
    },
    {
      value: 'korean',
      label: t('languages.korean'),
      emoji: '🇰🇷'
    },
    {
      value: 'russian',
      label: t('languages.russian'),
      emoji: '🇷🇺'
    },
    {
      value: 'spanish',
      label: t('languages.spanish'),
      emoji: '🇪🇸'
    },
    {
      value: 'french',
      label: t('languages.french'),
      emoji: '🇫🇷'
    },
    {
      value: 'italian',
      label: t('languages.italian'),
      emoji: '🇮🇹'
    },
    {
      value: 'portuguese',
      label: t('languages.portuguese'),
      emoji: '🇵🇹'
    },
    {
      value: 'arabic',
      label: t('languages.arabic'),
      emoji: '🇸🇦'
    }
  ]

  const translate = useCallback(async () => {
    if (!text.trim() || !translateModel) return

    const assistant: Assistant = getDefaultTranslateAssistant(targetLanguage, text)
    const message: Message = {
      id: uuid(),
      role: 'user',
      content: text,
      assistantId: assistant.id,
      topicId: uuid(),
      modelId: translateModel.id,
      createdAt: new Date().toISOString(),
      type: 'text',
      status: 'sending'
    }

    setLoading(true)
    const translateText = await fetchTranslate({ message, assistant })
    setResult(translateText)
    setLoading(false)
  }, [text, targetLanguage, translateModel])

  useEffect(() => {
    // 获取默认目标语言
    db.settings.get({ id: 'translate:target:language' }).then((targetLang) => {
      if (targetLang) {
        setTargetLanguage(targetLang.value)
      }
    })
  }, [])

  useEffect(() => {
    translate()
  }, [])

  return (
    <Container>
      <LanguageSelect>
        <Select
          value={targetLanguage}
          style={{ width: 140 }}
          optionFilterProp="label"
          options={languageOptions}
          onChange={(value) => {
            setTargetLanguage(value)
            translate()
          }}
          optionRender={(option) => (
            <Space>
              <span role="img" aria-label={option.data.label}>
                {option.data.emoji}
              </span>
              {option.label}
            </Space>
          )}
        />
      </LanguageSelect>
      <Main>{loading ? <LoadingText>翻译中...</LoadingText> : <ResultText>{result || text}</ResultText>}</Main>
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 12px;
  padding-right: 0;
  overflow: hidden;
  -webkit-app-region: none;
`

const Main = styled.div`
  display: flex;
  flex: 1;
  width: 100%;
  overflow: hidden;
`

const ResultText = styled(Scrollbar)`
  white-space: pre-wrap;
  word-break: break-word;
  width: 100%;
`

const LoadingText = styled.div`
  color: var(--color-text-2);
  font-style: italic;
`

const LanguageSelect = styled.div`
  margin-bottom: 8px;
`

export default Translate
