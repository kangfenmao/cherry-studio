import 'katex/dist/katex.min.css'

import { Message } from '@renderer/types'
import { isEmpty } from 'lodash'
import { FC, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import ReactMarkdown, { Components } from 'react-markdown'
import rehypeKatex from 'rehype-katex'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'

import CodeBlock from './CodeBlock'
import Link from './Link'

interface Props {
  message: Message
}

const rehypePlugins = [rehypeKatex]
const remarkPlugins = [remarkMath, remarkGfm]

const components = {
  code: CodeBlock,
  a: Link
}

const Markdown: FC<Props> = ({ message }) => {
  const { t } = useTranslation()

  const messageContent = useMemo(() => {
    const empty = isEmpty(message.content)
    const paused = message.status === 'paused'
    const content = empty && paused ? t('message.chat.completion.paused') : message.content
    return escapeBrackets(escapeDollarNumber(content))
  }, [message.content, message.status, t])

  return (
    <ReactMarkdown
      className="markdown"
      rehypePlugins={rehypePlugins}
      remarkPlugins={remarkPlugins}
      components={components as Partial<Components>}
      remarkRehypeOptions={{
        footnoteLabel: t('common.footnotes'),
        footnoteLabelTagName: 'h4',
        footnoteBackContent: ' '
      }}>
      {messageContent}
    </ReactMarkdown>
  )
}

function escapeDollarNumber(text: string) {
  let escapedText = ''

  for (let i = 0; i < text.length; i += 1) {
    let char = text[i]
    const nextChar = text[i + 1] || ' '

    if (char === '$' && nextChar >= '0' && nextChar <= '9') {
      char = '\\$'
    }

    escapedText += char
  }

  return escapedText
}

function escapeBrackets(text: string) {
  const pattern = /(```[\s\S]*?```|`.*?`)|\\\[([\s\S]*?[^\\])\\\]|\\\((.*?)\\\)/g
  return text.replace(pattern, (match, codeBlock, squareBracket, roundBracket) => {
    if (codeBlock) {
      return codeBlock
    } else if (squareBracket) {
      return `$$${squareBracket}$$`
    } else if (roundBracket) {
      return `$${roundBracket}$`
    }
    return match
  })
}

export default Markdown
