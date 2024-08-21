import { CheckOutlined } from '@ant-design/icons'
import CopyIcon from '@renderer/components/Icons/CopyIcon'
import { initMermaid } from '@renderer/init'
import { useTheme } from '@renderer/providers/ThemeProvider'
import { ThemeMode } from '@renderer/store/settings'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { atomDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import styled from 'styled-components'

import Mermaid from './Mermaid'

interface CodeBlockProps {
  children: string
  className?: string
  [key: string]: any
}

const CodeBlock: React.FC<CodeBlockProps> = ({ children, className, ...rest }) => {
  const match = /language-(\w+)/.exec(className || '')
  const [copied, setCopied] = useState(false)
  const { theme } = useTheme()

  const { t } = useTranslation()

  const onCopy = () => {
    navigator.clipboard.writeText(children)
    window.message.success({ content: t('message.copied'), key: 'copy-code' })
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (match && match[1] === 'mermaid') {
    initMermaid(theme)
    return <Mermaid chart={children} />
  }

  return match ? (
    <div>
      <CodeHeader>
        <CodeLanguage>{'<' + match[1].toUpperCase() + '>'}</CodeLanguage>
        {!copied && <CopyIcon className="copy" onClick={onCopy} />}
        {copied && <CheckOutlined style={{ color: 'var(--color-primary)' }} />}
      </CodeHeader>
      <SyntaxHighlighter
        {...rest}
        language={match[1]}
        style={theme === ThemeMode.dark ? atomDark : oneLight}
        wrapLongLines={true}
        customStyle={{ borderTopLeftRadius: 0, borderTopRightRadius: 0, marginTop: 0 }}>
        {String(children).replace(/\n$/, '')}
      </SyntaxHighlighter>
    </div>
  ) : (
    <code {...rest} className={className}>
      {children}
    </code>
  )
}

const CodeHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--color-text);
  font-size: 14px;
  font-weight: bold;
  background-color: var(--color-code-background);
  height: 40px;
  padding: 0 10px;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  .copy {
    cursor: pointer;
    color: var(--color-text-3);
    transition: color 0.3s;
  }
  .copy:hover {
    color: var(--color-text-1);
  }
`

const CodeLanguage = styled.div`
  font-weight: bold;
`

export default CodeBlock
