import { CheckOutlined } from '@ant-design/icons'
import CopyIcon from '@renderer/components/Icons/CopyIcon'
import { useTheme } from '@renderer/context/ThemeProvider'
import { initMermaid } from '@renderer/init'
import { ThemeMode } from '@renderer/types'
import React, { memo, useState } from 'react'
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

const CodeBlock: React.FC<CodeBlockProps> = ({ children, className }) => {
  const match = /language-(\w+)/.exec(className || '')
  const showFooterCopyButton = children && children.length > 500
  const { theme } = useTheme()

  if (match && match[1] === 'mermaid') {
    initMermaid(theme)
    return <Mermaid chart={children} />
  }

  return match ? (
    <div className="code-block">
      <CodeHeader>
        <CodeLanguage>{'<' + match[1].toUpperCase() + '>'}</CodeLanguage>
        <CopyButton text={children} />
      </CodeHeader>
      <SyntaxHighlighter
        language={match[1]}
        style={theme === ThemeMode.dark ? atomDark : oneLight}
        wrapLongLines={true}
        customStyle={{
          border: '0.5px solid var(--color-code-background)',
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          marginTop: 0
        }}>
        {String(children).replace(/\n$/, '')}
      </SyntaxHighlighter>
      {showFooterCopyButton && (
        <CodeFooter>
          <CopyButton text={children} style={{ marginTop: -40, marginRight: 10 }} />
        </CodeFooter>
      )}
    </div>
  ) : (
    <code className={className}>{children}</code>
  )
}

const CopyButton: React.FC<{ text: string; style?: React.CSSProperties }> = ({ text, style }) => {
  const [copied, setCopied] = useState(false)
  const { t } = useTranslation()

  const onCopy = () => {
    navigator.clipboard.writeText(text)
    window.message.success({ content: t('message.copied'), key: 'copy-code' })
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return copied ? (
    <CheckOutlined style={{ color: 'var(--color-primary)', ...style }} />
  ) : (
    <CopyIcon className="copy" style={style} onClick={onCopy} />
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
  height: 36px;
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

const CodeFooter = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  .copy {
    cursor: pointer;
    color: var(--color-text-3);
    transition: color 0.3s;
  }
  .copy:hover {
    color: var(--color-text-1);
  }
`

export default memo(CodeBlock)
