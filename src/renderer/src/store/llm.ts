import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { isLocalAi } from '@renderer/config/env'
import { SYSTEM_MODELS } from '@renderer/config/models'
import { Model, Provider } from '@renderer/types'
import { uniqBy } from 'lodash'

type LlmSettings = {
  ollama: {
    keepAliveTime: number
  }
}

export interface LlmState {
  providers: Provider[]
  defaultModel: Model
  topicNamingModel: Model
  translateModel: Model
  settings: LlmSettings
}

const initialState: LlmState = {
  defaultModel: SYSTEM_MODELS.openai[0],
  topicNamingModel: SYSTEM_MODELS.openai[0],
  translateModel: SYSTEM_MODELS.openai[0],
  providers: [
    {
      id: 'openai',
      name: 'OpenAI',
      apiKey: '',
      apiHost: 'https://api.openai.com',
      models: SYSTEM_MODELS.openai.filter((m) => m.enabled),
      isSystem: true,
      enabled: true
    },
    {
      id: 'gemini',
      name: 'Gemini',
      apiKey: '',
      apiHost: 'https://generativelanguage.googleapis.com',
      models: SYSTEM_MODELS.gemini.filter((m) => m.enabled),
      isSystem: true,
      enabled: false
    },
    {
      id: 'anthropic',
      name: 'Anthropic',
      apiKey: '',
      apiHost: 'https://api.anthropic.com/',
      models: SYSTEM_MODELS.anthropic.filter((m) => m.enabled),
      isSystem: true,
      enabled: false
    },
    {
      id: 'ollama',
      name: 'Ollama',
      apiKey: '',
      apiHost: 'http://localhost:11434/v1/',
      models: SYSTEM_MODELS.ollama.filter((m) => m.enabled),
      isSystem: true,
      enabled: false
    },
    {
      id: 'silicon',
      name: 'Silicon',
      apiKey: '',
      apiHost: 'https://api.siliconflow.cn',
      models: SYSTEM_MODELS.silicon.filter((m) => m.enabled),
      isSystem: true,
      enabled: false
    },
    {
      id: 'deepseek',
      name: 'deepseek',
      apiKey: '',
      apiHost: 'https://api.deepseek.com',
      models: SYSTEM_MODELS.deepseek.filter((m) => m.enabled),
      isSystem: true,
      enabled: false
    },
    {
      id: 'yi',
      name: 'Yi',
      apiKey: '',
      apiHost: 'https://api.lingyiwanwu.com',
      models: SYSTEM_MODELS.yi.filter((m) => m.enabled),
      isSystem: true,
      enabled: false
    },
    {
      id: 'zhipu',
      name: 'ZhiPu',
      apiKey: '',
      apiHost: 'https://open.bigmodel.cn/api/paas/v4/',
      models: SYSTEM_MODELS.zhipu.filter((m) => m.enabled),
      isSystem: true,
      enabled: false
    },
    {
      id: 'moonshot',
      name: 'Moonshot AI',
      apiKey: '',
      apiHost: 'https://api.moonshot.cn',
      models: SYSTEM_MODELS.moonshot.filter((m) => m.enabled),
      isSystem: true,
      enabled: false
    },
    {
      id: 'baichuan',
      name: 'BAICHUAN AI',
      apiKey: '',
      apiHost: 'https://api.baichuan-ai.com',
      models: SYSTEM_MODELS.baichuan.filter((m) => m.enabled),
      isSystem: true,
      enabled: false
    },
    {
      id: 'dashscope',
      name: 'DashScope',
      apiKey: '',
      apiHost: 'https://dashscope.aliyuncs.com/compatible-mode/v1/',
      models: SYSTEM_MODELS.dashscope.filter((m) => m.enabled),
      isSystem: true,
      enabled: false
    },
    {
      id: 'stepfun',
      name: 'StepFun',
      apiKey: '',
      apiHost: 'https://api.stepfun.com',
      models: SYSTEM_MODELS.stepfun.filter((m) => m.enabled),
      isSystem: true,
      enabled: false
    },
    {
      id: 'doubao',
      name: 'doubao',
      apiKey: '',
      apiHost: 'https://ark.cn-beijing.volces.com/api/v3/',
      models: SYSTEM_MODELS.doubao.filter((m) => m.enabled),
      isSystem: true,
      enabled: false
    },
    {
      id: 'minimax',
      name: 'MiniMax',
      apiKey: '',
      apiHost: 'https://api.minimax.chat/v1/',
      models: SYSTEM_MODELS.minimax.filter((m) => m.enabled),
      isSystem: true,
      enabled: false
    },
    {
      id: 'aihubmix',
      name: 'AiHubMix',
      apiKey: '',
      apiHost: 'https://aihubmix.com',
      models: SYSTEM_MODELS.aihubmix.filter((m) => m.enabled),
      isSystem: true,
      enabled: false
    },
    {
      id: 'graphrag-kylin-mountain',
      name: 'GraphRAG',
      apiKey: '',
      apiHost: '',
      models: [],
      isSystem: true,
      enabled: false
    },
    {
      id: 'openrouter',
      name: 'OpenRouter',
      apiKey: '',
      apiHost: 'https://openrouter.ai/api/v1/',
      models: SYSTEM_MODELS.openrouter.filter((m) => m.enabled),
      isSystem: true,
      enabled: false
    },
    {
      id: 'groq',
      name: 'Groq',
      apiKey: '',
      apiHost: 'https://api.groq.com/openai',
      models: SYSTEM_MODELS.groq.filter((m) => m.enabled),
      isSystem: true,
      enabled: false
    }
  ],
  settings: {
    ollama: {
      keepAliveTime: 0
    }
  }
}

const getIntegratedInitialState = () => {
  const model = JSON.parse(import.meta.env.VITE_RENDERER_INTEGRATED_MODEL)

  return {
    defaultModel: model,
    topicNamingModel: model,
    translateModel: model,
    providers: [
      {
        id: 'ollama',
        name: 'Ollama',
        apiKey: 'ollama',
        apiHost: 'http://localhost:15537/v1/',
        models: [model],
        isSystem: true,
        enabled: true
      }
    ],
    settings: {
      ollama: {
        keepAliveTime: 3600
      }
    }
  } as LlmState
}

const settingsSlice = createSlice({
  name: 'llm',
  initialState: isLocalAi ? getIntegratedInitialState() : initialState,
  reducers: {
    updateProvider: (state, action: PayloadAction<Provider>) => {
      state.providers = state.providers.map((p) => (p.id === action.payload.id ? { ...p, ...action.payload } : p))
    },
    updateProviders: (state, action: PayloadAction<Provider[]>) => {
      state.providers = action.payload
    },
    addProvider: (state, action: PayloadAction<Provider>) => {
      state.providers.push(action.payload)
    },
    removeProvider: (state, action: PayloadAction<Provider>) => {
      state.providers = state.providers.filter((p) => p.id !== action.payload.id)
    },
    addModel: (state, action: PayloadAction<{ providerId: string; model: Model }>) => {
      state.providers = state.providers.map((p) =>
        p.id === action.payload.providerId
          ? {
              ...p,
              models: uniqBy(p.models.concat(action.payload.model), 'id')
            }
          : p
      )
    },
    removeModel: (state, action: PayloadAction<{ providerId: string; model: Model }>) => {
      state.providers = state.providers.map((p) =>
        p.id === action.payload.providerId
          ? {
              ...p,
              models: p.models.filter((m) => m.id !== action.payload.model.id)
            }
          : p
      )
    },
    setDefaultModel: (state, action: PayloadAction<{ model: Model }>) => {
      state.defaultModel = action.payload.model
    },
    setTopicNamingModel: (state, action: PayloadAction<{ model: Model }>) => {
      state.topicNamingModel = action.payload.model
    },
    setTranslateModel: (state, action: PayloadAction<{ model: Model }>) => {
      state.translateModel = action.payload.model
    },
    setOllamaKeepAliveTime: (state, action: PayloadAction<number>) => {
      state.settings.ollama.keepAliveTime = action.payload
    }
  }
})

export const {
  updateProvider,
  updateProviders,
  addProvider,
  removeProvider,
  addModel,
  removeModel,
  setDefaultModel,
  setTopicNamingModel,
  setTranslateModel,
  setOllamaKeepAliveTime
} = settingsSlice.actions

export default settingsSlice.reducer
