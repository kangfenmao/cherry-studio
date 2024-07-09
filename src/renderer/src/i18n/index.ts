import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const resources = {
  'en-US': {
    translation: {
      settings: {
        title: 'Settings',
        general: 'General',
        provider: 'Model Provider',
        model: 'Model Settings',
        assistant: 'Default Assistant',
        about: 'About'
      }
    }
  },
  'zh-CN': {
    translation: {
      settings: {
        title: '设置',
        general: '常规',
        provider: '模型提供商',
        model: '模型设置',
        assistant: '默认助手',
        about: '关于'
      }
    }
  }
}

i18n.use(initReactI18next).init({
  resources,
  lng: 'en-US',
  fallbackLng: 'en-US',
  interpolation: {
    escapeValue: false
  }
})

export default i18n
