import 'katex/dist/katex.min.css'

import { Message } from '@renderer/types'
import { isEmpty } from 'lodash'
import { FC, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import ReactMarkdown from 'react-markdown'
import rehypeKatex from 'rehype-katex'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'

import CodeBlock from './CodeBlock'
import Link from './Link'

interface Props {
  message: Message
}

const Markdown: FC<Props> = ({ message }) => {
  const { t } = useTranslation()

  const messageContent = useMemo(() => {
    const empty = isEmpty(message.content)
    const paused = message.status === 'paused'
    const content = empty && paused ? t('message.chat.completion.paused') : message.content
    return content
  }, [message.content, message.status, t])

  return useMemo(() => {
    return (
      <ReactMarkdown
        className="markdown"
        rehypePlugins={[rehypeKatex]}
        remarkPlugins={[remarkMath, remarkGfm]}
        remarkRehypeOptions={{
          footnoteLabel: t('common.footnotes'),
          footnoteLabelTagName: 'h4',
          footnoteBackContent: ' '
        }}
        components={{ code: CodeBlock as any, a: Link as any }}>
        {messageContent}
      </ReactMarkdown>
    )
  }, [messageContent, t])
}

export default Markdown
