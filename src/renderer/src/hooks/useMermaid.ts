import { useTheme } from '@renderer/context/ThemeProvider'
import { ThemeMode } from '@renderer/types'
import { loadScript, runAsyncFunction } from '@renderer/utils'
import { useEffect } from 'react'

import { useRuntime } from './useRuntime'

export const useMermaid = () => {
  const { theme } = useTheme()
  const { generating } = useRuntime()

  useEffect(() => {
    runAsyncFunction(async () => {
      if (!window.mermaid) {
        await loadScript('https://unpkg.com/mermaid@11.4.0/dist/mermaid.min.js')
        window.mermaid.initialize({
          startOnLoad: true,
          theme: theme === ThemeMode.dark ? 'dark' : 'default'
        })
        window.mermaid.contentLoaded()
      }
    })
  }, [])

  useEffect(() => {
    if (window.mermaid) {
      window.mermaid.initialize({
        startOnLoad: true,
        theme: theme === ThemeMode.dark ? 'dark' : 'default'
      })
      window.mermaid.contentLoaded()
    }
  }, [theme])

  useEffect(() => {
    if (!window.mermaid || generating) return

    const renderMermaid = () => {
      const mermaidElements = document.querySelectorAll('.mermaid')
      mermaidElements.forEach((element) => {
        if (!element.querySelector('svg')) {
          element.removeAttribute('data-processed')
        }
      })
      window.mermaid.contentLoaded()
    }

    setTimeout(renderMermaid, 100)
  }, [generating])
}
