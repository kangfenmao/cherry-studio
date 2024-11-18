import { CheckOutlined, DownOutlined, RightOutlined } from '@ant-design/icons'
import CopyIcon from '@renderer/components/Icons/CopyIcon'
import { useSyntaxHighlighter } from '@renderer/context/SyntaxHighlighterProvider'
import { useSettings } from '@renderer/hooks/useSettings'
import React, { memo, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import Artifacts from './Artifacts'
import Mermaid from './Mermaid'

interface CodeBlockProps {
  children: string
  className?: string
  [key: string]: any
}

const CollapseIcon: React.FC<{ expanded: boolean; onClick: () => void }> = ({ expanded, onClick }) => {
  return expanded ? (
    <DownOutlined style={{ cursor: 'pointer' }} onClick={onClick} />
  ) : (
    <RightOutlined style={{ cursor: 'pointer' }} onClick={onClick} />
  )
}

const ExpandButton: React.FC<{
  isExpanded: boolean
  onClick: () => void
  showButton: boolean
}> = ({ isExpanded, onClick, showButton }) => {
  if (!showButton) return null

  return (
    <div
      style={{
        textAlign: 'center',
        cursor: 'pointer',
        padding: '8px',
        color: 'var(--color-text-3)',
        borderTop: '0.5px solid var(--color-code-background)'
      }}
      onClick={onClick}>
      {isExpanded ? '收起' : '展开'}
    </div>
  )
}

const CodeBlock: React.FC<CodeBlockProps> = ({ children, className }) => {
  const match = /language-(\w+)/.exec(className || '')
  const showFooterCopyButton = children && children.length > 500
  const { codeShowLineNumbers, fontSize } = useSettings()
  const language = match?.[1] ?? 'text'
  const [html, setHtml] = useState<string>('')
  const { codeToHtml } = useSyntaxHighlighter()
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    const loadHighlightedCode = async () => {
      const highlightedHtml = await codeToHtml(children, language)
      setHtml(highlightedHtml)
    }
    loadHighlightedCode()
  }, [children, language, codeToHtml])

  if (language === 'mermaid') {
    return <Mermaid chart={children} />
  }

  return match ? (
    <div className="code-block">
      <CodeHeader>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CollapseIcon expanded={isExpanded} onClick={() => setIsExpanded(!isExpanded)} />
          <CodeLanguage>{'<' + match[1].toUpperCase() + '>'}</CodeLanguage>
        </div>
        <CopyButton text={children} />
      </CodeHeader>
      <CodeContent
        isShowLineNumbers={codeShowLineNumbers}
        dangerouslySetInnerHTML={{ __html: html }}
        style={{
          border: '0.5px solid var(--color-code-background)',
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          marginTop: 0,
          fontSize,
          maxHeight: isExpanded ? 'none' : '300px',
          overflow: 'hidden',
          position: 'relative'
        }}
      />
      <ExpandButton
        isExpanded={isExpanded}
        onClick={() => setIsExpanded(!isExpanded)}
        showButton={!isExpanded || showFooterCopyButton}
      />
      {showFooterCopyButton && (
        <CodeFooter>
          <CopyButton text={children} style={{ marginTop: -40, marginRight: 10 }} />
        </CodeFooter>
      )}
      {language === 'html' && children?.includes('</html>') && <Artifacts html={children} />}
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

const CodeContent = styled.div<{ isShowLineNumbers: boolean }>`
  .shiki {
    padding: 1em;
  }

  ${(props) =>
    props.isShowLineNumbers &&
    `
      code {
        counter-reset: step;
        counter-increment: step 0;
      }

      code .line::before {
        content: counter(step);
        counter-increment: step;
        width: 1rem;
        margin-right: 1rem;
        display: inline-block;
        text-align: right;
        opacity: 0.35;
      }
    `}
`

const CodeHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--color-text);
  font-size: 14px;
  font-weight: bold;
  height: 34px;
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
