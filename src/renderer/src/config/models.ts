import { Model } from '@renderer/types'

type SystemModel = Model & { defaultEnabled: boolean }

export const SYSTEM_MODELS: Record<string, SystemModel[]> = {
  openai: [
    {
      id: 'gpt-3.5-turbo',
      provider: 'openai',
      name: 'GPT-3.5 Turbo',
      group: 'GPT 3.5',
      temperature: 0.7,
      defaultEnabled: true
    },
    {
      id: 'gpt-4-turbo',
      provider: 'openai',
      name: ' GPT-4 Turbo',
      group: 'GPT 4',
      temperature: 0.7,
      defaultEnabled: true
    },
    {
      id: 'gpt-4',
      provider: 'openai',
      name: ' GPT-4',
      group: 'GPT 4',
      temperature: 0.7,
      defaultEnabled: true
    },
    {
      id: 'gpt-4o',
      provider: 'openai',
      name: ' GPT-4o',
      group: 'GPT 4o',
      temperature: 0.7,
      defaultEnabled: true
    }
  ],
  silicon: [
    {
      id: 'Qwen/Qwen2-7B-Instruct',
      provider: 'silicon',
      name: 'Qwen2-7B-Instruct',
      group: 'Qwen2',
      temperature: 0.7,
      defaultEnabled: true
    },
    {
      id: 'Qwen/Qwen2-1.5B-Instruct',
      provider: 'silicon',
      name: 'Qwen2-1.5B-Instruct',
      group: 'Qwen2',
      temperature: 0.7,
      defaultEnabled: false
    },
    {
      id: 'Qwen/Qwen1.5-7B-Chat',
      provider: 'silicon',
      name: 'Qwen1.5-7B-Chat',
      group: 'Qwen1.5',
      temperature: 0.7,
      defaultEnabled: false
    },
    {
      id: 'Qwen/Qwen2-72B-Instruct',
      provider: 'silicon',
      name: 'Qwen2-72B-Instruct',
      group: 'Qwen2',
      temperature: 0.7,
      defaultEnabled: true
    },
    {
      id: 'Qwen/Qwen2-57B-A14B-Instruct',
      provider: 'silicon',
      name: 'Qwen2-57B-A14B-Instruct',
      group: 'Qwen2',
      temperature: 0.7,
      defaultEnabled: false
    },
    {
      id: 'Qwen/Qwen1.5-110B-Chat',
      provider: 'silicon',
      name: 'Qwen1.5-110B-Chat',
      group: 'Qwen1.5',
      temperature: 0.7,
      defaultEnabled: false
    },
    {
      id: 'Qwen/Qwen1.5-32B-Chat',
      provider: 'silicon',
      name: 'Qwen1.5-32B-Chat',
      group: 'Qwen1.5',
      temperature: 0.7,
      defaultEnabled: false
    },
    {
      id: 'Qwen/Qwen1.5-14B-Chat',
      provider: 'silicon',
      name: 'Qwen1.5-14B-Chat',
      group: 'Qwen1.5',
      temperature: 0.7,
      defaultEnabled: false
    },
    {
      id: 'deepseek-ai/DeepSeek-V2-Chat',
      provider: 'silicon',
      name: 'DeepSeek-V2-Chat',
      group: 'DeepSeek',
      temperature: 0.7,
      defaultEnabled: false
    },
    {
      id: 'deepseek-ai/DeepSeek-Coder-V2-Instruct',
      provider: 'silicon',
      name: 'DeepSeek-Coder-V2-Instruct',
      group: 'DeepSeek',
      temperature: 0.7,
      defaultEnabled: false
    },
    {
      id: 'deepseek-ai/deepseek-llm-67b-chat',
      provider: 'silicon',
      name: 'deepseek-llm-67b-chat',
      group: 'DeepSeek',
      temperature: 0.7,
      defaultEnabled: false
    },
    {
      id: 'google/gemma-2-27b-it',
      provider: 'silicon',
      name: 'gemma-2-27b-it',
      group: 'Gemma',
      temperature: 0.7,
      defaultEnabled: false
    },
    {
      id: 'google/gemma-2-9b-it',
      provider: 'silicon',
      name: 'gemma-2-9b-it',
      group: 'Gemma',
      temperature: 0.7,
      defaultEnabled: false
    },
    {
      id: 'THUDM/glm-4-9b-chat',
      provider: 'silicon',
      name: 'glm-4-9b-chat',
      group: 'GLM',
      temperature: 0.7,
      defaultEnabled: true
    },
    {
      id: 'THUDM/chatglm3-6b',
      provider: 'silicon',
      name: 'chatglm3-6b',
      group: 'GLM',
      temperature: 0.7,
      defaultEnabled: false
    },
    {
      id: '01-ai/Yi-1.5-9B-Chat-16K',
      provider: 'silicon',
      name: 'Yi-1.5-9B-Chat-16K',
      group: 'Yi',
      temperature: 0.7,
      defaultEnabled: false
    },
    {
      id: '01-ai/Yi-1.5-6B-Chat',
      provider: 'silicon',
      name: 'Yi-1.5-6B-Chat',
      group: 'Yi',
      temperature: 0.7,
      defaultEnabled: false
    },
    {
      id: '01-ai/Yi-1.5-34B-Chat-16K',
      provider: 'silicon',
      name: 'Yi-1.5-34B-Chat-16K',
      group: 'Yi',
      temperature: 0.7,
      defaultEnabled: false
    }
  ],
  deepseek: [
    {
      id: 'deepseek-chat',
      provider: 'deepseek',
      name: 'deepseek-chat',
      group: 'Deepseek Chat',
      temperature: 0.7,
      defaultEnabled: true
    },
    {
      id: 'deepseek-coder',
      provider: 'deepseek',
      name: 'deepseek-coder',
      group: 'Deepseek Coder',
      temperature: 1.0,
      defaultEnabled: true
    }
  ],
  yi: [
    {
      id: 'yi-large',
      provider: 'yi',
      name: 'yi-large',
      group: 'Yi',
      temperature: 0.7,
      defaultEnabled: false
    },
    {
      id: 'yi-large-turbo',
      provider: 'yi',
      name: 'yi-large-turbo',
      group: 'Yi',
      temperature: 0.7,
      defaultEnabled: true
    },
    {
      id: 'yi-large-rag',
      provider: 'yi',
      name: 'yi-large-rag',
      group: 'Yi',
      temperature: 0.7,
      defaultEnabled: false
    },
    {
      id: 'yi-medium',
      provider: 'yi',
      name: 'yi-medium',
      group: 'Yi',
      temperature: 0.7,
      defaultEnabled: true
    },
    {
      id: 'yi-medium-200k',
      provider: 'yi',
      name: 'yi-medium-200k',
      group: 'Yi',
      temperature: 0.7,
      defaultEnabled: false
    },
    {
      id: 'yi-spark',
      provider: 'yi',
      name: 'yi-spark',
      group: 'Yi',
      temperature: 0.7,
      defaultEnabled: false
    }
  ],
  groq: [
    {
      id: 'llama3-8b-8192',
      provider: 'groq',
      name: 'LLaMA3 8b',
      group: 'Llama3',
      temperature: 0.7,
      defaultEnabled: false
    },
    {
      id: 'llama3-70b-8192',
      provider: 'groq',
      name: 'LLaMA3 70b',
      group: 'Llama3',
      temperature: 0.7,
      defaultEnabled: true
    },
    {
      id: 'mixtral-8x7b-32768',
      provider: 'groq',
      name: 'Mixtral 8x7b',
      group: 'Mixtral',
      temperature: 0.7,
      defaultEnabled: false
    },
    {
      id: 'gemma-7b-it',
      provider: 'groq',
      name: 'Gemma 7b',
      group: 'Gemma',
      temperature: 0.7,
      defaultEnabled: false
    }
  ]
}
