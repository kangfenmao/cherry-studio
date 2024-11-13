import react from '@vitejs/plugin-react'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import { resolve } from 'path'

export default defineConfig({
  main: {
    plugins: [
      externalizeDepsPlugin({
        exclude: [
          '@llm-tools/embedjs',
          '@llm-tools/embedjs-lancedb',
          '@llm-tools/embedjs-ollama',
          '@llm-tools/embedjs-openai',
          '@llm-tools/embedjs-loader-web',
          '@llm-tools/embedjs-loader-markdown',
          '@llm-tools/embedjs-loader-msoffice',
          '@llm-tools/embedjs-loader-xml',
          '@llm-tools/embedjs-loader-pdf',
          '@lancedb/lancedb'
        ]
      })
    ],
    resolve: {
      alias: {
        '@main': resolve('src/main'),
        '@types': resolve('src/renderer/src/types'),
        '@shared': resolve('packages/shared')
      }
    },
    build: {
      rollupOptions: {
        external: ['@lancedb/lancedb', '@llm-tools/embedjs-loader-sitemap']
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    plugins: [react()],
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src'),
        '@shared': resolve('packages/shared')
      }
    },
    optimizeDeps: {
      exclude: ['chunk-7UIZINC5.js', 'chunk-7OJJKI46.js']
    }
  }
})
