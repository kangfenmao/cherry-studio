import { createMigrate } from 'redux-persist'
import { RootState } from '.'
import { SYSTEM_MODELS } from '@renderer/config/models'
import { isEmpty } from 'lodash'
import i18n from '@renderer/i18n'
import { Assistant } from '@renderer/types'

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
  },
  // @ts-ignore store type is unknown
  '7': (state: RootState) => {
    return {
      ...state,
      settings: {
        ...state.settings,
        language: navigator.language
      }
    }
  },
  // @ts-ignore store type is unknown
  '8': (state: RootState) => {
    const fixAssistantName = (assistant: Assistant) => {
      if (isEmpty(assistant.name)) {
        assistant.name = i18n.t(`assistant.${assistant.id}.name`)
      }

      assistant.topics = assistant.topics.map((topic) => {
        if (isEmpty(topic.name)) {
          topic.name = i18n.t(`assistant.${assistant.id}.topic.name`)
        }
        return topic
      })

      return assistant
    }

    return {
      ...state,
      assistants: {
        ...state.assistants,
        defaultAssistant: fixAssistantName(state.assistants.defaultAssistant),
        assistants: state.assistants.assistants.map((assistant) => fixAssistantName(assistant))
      }
    }
  },
  // @ts-ignore store type is unknown
  '9': (state: RootState) => {
    return {
      ...state,
      llm: {
        ...state.llm,
        providers: state.llm.providers.map((provider) => {
          if (provider.id === 'zhipu' && provider.models[0] && provider.models[0].id === 'llama3-70b-8192') {
            provider.models = SYSTEM_MODELS.zhipu.filter((m) => m.defaultEnabled)
          }
          return provider
        })
      }
    }
  },
  // @ts-ignore store type is unknown
  '10': (state: RootState) => {
    return {
      ...state,
      llm: {
        ...state.llm,
        providers: [
          ...state.llm.providers,
          {
            id: 'baichuan',
            name: 'BAICHUAN AI',
            apiKey: '',
            apiHost: 'https://api.baichuan-ai.com',
            models: SYSTEM_MODELS.baichuan.filter((m) => m.defaultEnabled),
            isSystem: true,
            enabled: false
          }
        ]
      }
    }
  }
})

export default migrate
