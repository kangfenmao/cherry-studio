import { useTheme } from '@renderer/context/ThemeProvider'
import { useSettings } from '@renderer/hooks/useSettings'
import { CodeStyleVarious, ThemeMode } from '@renderer/types'
import { loadScript } from '@renderer/utils'
import React, { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react'
import {
  BundledLanguage,
  bundledLanguages,
  BundledTheme,
  bundledThemes,
  createHighlighter,
  HighlighterGeneric
} from 'shiki'

interface SyntaxHighlighterContextType {
  codeToHtml: (code: string, language: string) => Promise<string>
}

const SyntaxHighlighterContext = createContext<SyntaxHighlighterContextType | undefined>(undefined)

export const SyntaxHighlighterProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const { theme } = useTheme()
  const [highlighter, setHighlighter] = useState<HighlighterGeneric<BundledLanguage, BundledTheme> | null>(null)
  const { codeStyle } = useSettings()

  const highlighterTheme = useMemo(() => {
    if (!codeStyle || codeStyle === 'auto') {
      return theme === ThemeMode.light ? 'one-light' : 'material-theme-darker'
    }

    return codeStyle
  }, [theme, codeStyle])

  useEffect(() => {
    const initMermaid = async () => {
      if (!window.mermaid) {
        await loadScript('https://unpkg.com/mermaid@11.4.0/dist/mermaid.min.js')
        window.mermaid.initialize({
          startOnLoad: true,
          theme: theme === ThemeMode.dark ? 'dark' : 'default'
        })
        window.mermaid.contentLoaded()
      }
    }

    initMermaid()
  }, [theme])

  useEffect(() => {
    const initHighlighter = async () => {
      const commonLanguages = ['javascript', 'typescript', 'python', 'java', 'markdown']

      const hl = await createHighlighter({
        themes: [highlighterTheme],
        langs: commonLanguages
      })

      setHighlighter(hl)

      window.requestIdleCallback(
        () => {
          hl.loadTheme(...(Object.keys(bundledThemes) as BundledTheme[]))
          hl.loadLanguage(...(Object.keys(bundledLanguages) as BundledLanguage[]))
        },
        { timeout: 2000 }
      )
    }

    initHighlighter()
  }, [highlighterTheme, theme])

  const codeToHtml = async (code: string, language: string) => {
    if (!highlighter) return ''

    try {
      if (!highlighter.getLoadedLanguages().includes(language as BundledLanguage)) {
        if (language in bundledLanguages) {
          await highlighter.loadLanguage(language as BundledLanguage)
          console.log(`Loaded language: ${language}`)
        } else {
          console.warn(`Language '${language}' is not supported`)
          return `<pre><code>${code}</code></pre>`
        }
      }

      return highlighter.codeToHtml(code, {
        lang: language,
        theme: highlighterTheme
      })
    } catch (error) {
      console.warn(`Error highlighting code for language '${language}':`, error)
      return `<pre><code>${code}</code></pre>`
    }
  }

  return <SyntaxHighlighterContext.Provider value={{ codeToHtml }}>{children}</SyntaxHighlighterContext.Provider>
}

export const useSyntaxHighlighter = () => {
  const context = useContext(SyntaxHighlighterContext)
  if (!context) {
    throw new Error('useSyntaxHighlighter must be used within a SyntaxHighlighterProvider')
  }
  return context
}

export const codeThemes = ['auto', ...Object.keys(bundledThemes)] as CodeStyleVarious[]
