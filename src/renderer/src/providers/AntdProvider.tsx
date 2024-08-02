import { useSettings } from '@renderer/hooks/useSettings'
import { ConfigProvider, theme } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { FC, PropsWithChildren } from 'react'

import { useTheme } from './ThemeProvider'

const AntdProvider: FC<PropsWithChildren> = ({ children }) => {
  const { language } = useSettings()
  const { theme: _theme } = useTheme()

  return (
    <ConfigProvider
      locale={getAntdLocale(language)}
      theme={{
        algorithm: [_theme === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm],
        token: {
          colorPrimary: '#00b96b',
          borderRadius: 3
        }
      }}>
      {children}
    </ConfigProvider>
  )
}

function getAntdLocale(language: string) {
  switch (language) {
    case 'zh-CN':
      return zhCN
    case 'en-US':
      return undefined
    default:
      return zhCN
  }
}

export default AntdProvider
