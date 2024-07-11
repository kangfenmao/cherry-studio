import { createMigrate } from 'redux-persist'
import { RootState } from '.'
import { SYSTEM_MODELS } from '@renderer/config/models'

const migrate = createMigrate({
  // @ts-ignore store type is unknown
  '2': (state: RootState) => {
    return {
      ...state,
      llm: {
        ...state.llm,
        providers: [
          ...state.llm.providers,
          {
            id: 'yi',
            name: 'Yi',
            apiKey: '',
            apiHost: 'https://api.lingyiwanwu.com',
            isSystem: true,
            models: SYSTEM_MODELS.yi.filter((m) => m.defaultEnabled)
          }
        ]
      }
    }
  },
  // @ts-ignore store type is unknown
  '3': (state: RootState) => {
    return {
      ...state,
      llm: {
        ...state.llm,
        providers: [
          ...state.llm.providers,
          {
            id: 'zhipu',
            name: 'ZhiPu',
            apiKey: '',
            apiHost: 'https://open.bigmodel.cn/api/paas/v4/',
            isSystem: true,
            models: SYSTEM_MODELS.zhipu.filter((m) => m.defaultEnabled)
          }
        ]
      }
    }
  },
  // @ts-ignore store type is unknown
  '4': (state: RootState) => {
    return {
      ...state,
      llm: {
        ...state.llm,
        providers: [
          ...state.llm.providers,
          {
            id: 'ollama',
            name: 'Ollama',
            apiKey: '',
            apiHost: 'http://localhost:11434/v1/',
            isSystem: true,
            models: []
          }
        ]
      }
    }
  },
  // @ts-ignore store type is unknown
  '5': (state: RootState) => {
    return {
      ...state,
      llm: {
        ...state.llm,
        providers: [
          ...state.llm.providers,
          {
            id: 'moonshot',
            name: 'Moonshot',
            apiKey: '',
            apiHost: 'https://api.moonshot.cn',
            isSystem: true,
            models: SYSTEM_MODELS.moonshot.filter((m) => m.defaultEnabled)
          }
        ]
      }
    }
  },
  // @ts-ignore store type is unknown
  '6': (state: RootState) => {
    return {
      ...state,
      llm: {
        ...state.llm,
        providers: [
          ...state.llm.providers,
          {
            id: 'openrouter',
            name: 'OpenRouter',
            apiKey: '',
            apiHost: 'https://openrouter.ai/api/v1/',
            models: SYSTEM_MODELS.openrouter.filter((m) => m.defaultEnabled),
            isSystem: true
          }
        ]
      }
    }
  }
})

export default migrate
