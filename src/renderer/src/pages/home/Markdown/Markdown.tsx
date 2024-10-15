import 'katex/dist/katex.min.css'

import { useSettings } from '@renderer/hooks/useSettings'
import { Message } from '@renderer/types'
import { escapeBrackets } from '@renderer/utils/formula'
import { isEmpty } from 'lodash'
import { FC, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import ReactMarkdown, { Components } from 'react-markdown'
// @ts-ignore next-line
import rehypeMathjax from 'rehype-mathjax'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'

import CodeBlock from './CodeBlock'
import ImagePreview from './ImagePreview'
import Link from './Link'

interface Props {
  message: Message
}

const Markdown: FC<Props> = ({ message }) => {
  const { t } = useTranslation()
  const { renderInputMessageAsMarkdown } = useSettings()

  const messageContent = useMemo(() => {
    const empty = isEmpty(message.content)
    const paused = message.status === 'paused'
    const content = empty && paused ? t('message.chat.completion.paused') : message.content
    return escapeBrackets(content)
  }, [message.content, message.status, t])

  const rehypePlugins = useMemo(() => {
    const hasUnsafeElements = /<(input|textarea|select)/i.test(messageContent)
    return hasUnsafeElements ? [rehypeMathjax] : [rehypeRaw, rehypeMathjax]
  }, [messageContent])

  if (message.role === 'user' && !renderInputMessageAsMarkdown) {
    return <p style={{ marginBottom: 5, whiteSpace: 'pre-wrap' }}>{messageContent}</p>
  }

  return (
    <ReactMarkdown
      className="markdown"
      rehypePlugins={rehypePlugins}
      remarkPlugins={[remarkMath, remarkGfm]}
      disallowedElements={['style']}
      components={
        {
          a: Link,
          code: CodeBlock,
          img: ImagePreview
        } as Partial<Components>
      }
      remarkRehypeOptions={{
        footnoteLabel: t('common.footnotes'),
        footnoteLabelTagName: 'h4',
        footnoteBackContent: ' '
      }}>
      {messageContent}
    </ReactMarkdown>
  )
}

export default Markdown
