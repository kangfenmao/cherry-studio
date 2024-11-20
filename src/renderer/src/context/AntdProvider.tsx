import { useSettings } from '@renderer/hooks/useSettings'
import { LanguageVarious } from '@renderer/types'
import { ConfigProvider, theme } from 'antd'
import enUS from 'antd/locale/en_US'
import ruRU from 'antd/locale/ru_RU'
import zhCN from 'antd/locale/zh_CN'
import zhTW from 'antd/locale/zh_TW'
import { FC, PropsWithChildren } from 'react'

import { useTheme } from './ThemeProvider'

const AntdProvider: FC<PropsWithChildren> = ({ children }) => {
  const { language } = useSettings()
  const { theme: _theme } = useTheme()
  const isDarkTheme = _theme === 'dark'

  return (
    <ConfigProvider
      locale={getAntdLocale(language)}
      theme={{
        algorithm: [_theme === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm],
        components: {
          Segmented: {
            trackBg: 'transparent',
            itemSelectedBg: isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
            boxShadowTertiary: undefined,
            borderRadiusLG: 6,
            borderRadiusSM: 6,
            borderRadiusXS: 6
          },
          Menu: {
            activeBarBorderWidth: 0,
            darkItemBg: 'transparent'
          },
          Modal: {
            colorBgMask: isDarkTheme ? 'rgba(0, 0, 0, 0.85)' : 'rgba(255, 255, 255, 0.9)'
          }
        },
        token: {
          colorPrimary: '#00b96b',
          borderRadius: 6
        }
      }}>
      {children}
    </ConfigProvider>
  )
}

function getAntdLocale(language: LanguageVarious) {
  switch (language) {
    case 'zh-CN':
      return zhCN
    case 'zh-TW':
      return zhTW
    case 'en-US':
      return enUS
    case 'ru-RU':
      return ruRU

    default:
      return zhCN
  }
}

export default AntdProvider
