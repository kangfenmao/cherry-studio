import store from '@renderer/store'
import { theme, ThemeConfig } from 'antd'
import zhCN from 'antd/locale/zh_CN'

export const colorPrimary = '#00b96b'

export const AntdThemeConfig: ThemeConfig = {
  token: {
    colorPrimary,
    borderRadius: 5
  },
  algorithm: [theme.darkAlgorithm]
}

export function getAntdLocale() {
  const language = store.getState().settings.language

  switch (language) {
    case 'zh-CN':
      return zhCN
    case 'en-US':
      return undefined
    default:
      return zhCN
  }
}
