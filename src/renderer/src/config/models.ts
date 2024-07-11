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
      name: 'Deepseek-LLM-67B-Chat',
      group: 'DeepSeek',
      temperature: 0.7,
      defaultEnabled: false
    },
    {
      id: 'THUDM/glm-4-9b-chat',
      provider: 'silicon',
      name: 'GLM-4-9B-Chat',
      group: 'GLM',
      temperature: 0.7,
      defaultEnabled: true
    },
    {
      id: 'THUDM/chatglm3-6b',
      provider: 'silicon',
      name: 'GhatGLM3-6B',
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
      name: 'DeepSeek Chat',
      group: 'DeepSeek Chat',
      temperature: 0.7,
      defaultEnabled: true
    },
    {
      id: 'deepseek-coder',
      provider: 'deepseek',
      name: 'DeepSeek Coder',
      group: 'DeepSeek Coder',
      temperature: 1.0,
      defaultEnabled: true
    }
  ],
  yi: [
    {
      id: 'yi-large',
      provider: 'yi',
      name: 'Yi-Large',
      group: 'Yi',
      temperature: 0.7,
      defaultEnabled: false
    },
    {
      id: 'yi-large-turbo',
      provider: 'yi',
      name: 'Yi-Large-Turbo',
      group: 'Yi',
      temperature: 0.7,
      defaultEnabled: true
    },
    {
      id: 'yi-large-rag',
      provider: 'yi',
      name: 'Yi-Large-Rag',
      group: 'Yi',
      temperature: 0.7,
      defaultEnabled: false
    },
    {
      id: 'yi-medium',
      provider: 'yi',
      name: 'Yi-Medium',
      group: 'Yi',
      temperature: 0.7,
      defaultEnabled: true
    },
    {
      id: 'yi-medium-200k',
      provider: 'yi',
      name: 'Yi-Medium-200k',
      group: 'Yi',
      temperature: 0.7,
      defaultEnabled: false
    },
    {
      id: 'yi-spark',
      provider: 'yi',
      name: 'Yi-Spark',
      group: 'Yi',
      temperature: 0.7,
      defaultEnabled: false
    }
  ],
  zhipu: [
    {
      id: 'glm-4-0520',
      provider: 'zhipu',
      name: 'GLM-4-0520',
      group: 'GLM',
      temperature: 0.7,
      defaultEnabled: true
    },
    {
      id: 'glm-4',
      provider: 'zhipu',
      name: 'GLM-4',
      group: 'GLM',
      temperature: 0.7,
      defaultEnabled: false
    },
    {
      id: 'glm-4-airx',
      provider: 'zhipu',
      name: 'GLM-4-AirX',
      group: 'GLM',
      temperature: 0.7,
      defaultEnabled: false
    },
    {
      id: 'glm-4-air',
      provider: 'zhipu',
      name: 'GLM-4-Air',
      group: 'GLM',
      temperature: 0.7,
      defaultEnabled: true
    },
    {
      id: 'glm-4v',
      provider: 'zhipu',
      name: 'GLM-4V',
      group: 'GLM',
      temperature: 0.7,
      defaultEnabled: false
    },
    {
      id: 'glm-4-alltools',
      provider: 'zhipu',
      name: 'GLM-4-AllTools',
      group: 'GLM',
      temperature: 0.7,
      defaultEnabled: false
    }
  ],
  moonshot: [
    {
      id: 'moonshot-v1-8k',
      provider: 'moonshot',
      name: 'Moonshot V1 8k',
      group: 'Moonshot V1',
      temperature: 0.7,
      defaultEnabled: true
    },
    {
      id: 'moonshot-v1-32k',
      provider: 'moonshot',
      name: 'Moonshot V1 32k',
      group: 'Moonshot V1',
      temperature: 0.7,
      defaultEnabled: true
    },
    {
      id: 'moonshot-v1-128k',
      provider: 'moonshot',
      name: 'Moonshot V1 128k',
      group: 'Moonshot V1',
      temperature: 0.7,
      defaultEnabled: true
    }
  ],
  openrouter: [
    {
      id: 'google/gemma-2-9b-it:free',
      provider: 'openrouter',
      name: 'Google: Gemma 2 9B',
      group: 'Gemma',
      temperature: 0.7,
      defaultEnabled: true
    },
    {
      id: 'microsoft/phi-3-mini-128k-instruct:free',
      provider: 'openrouter',
      name: 'Phi-3 Mini 128K Instruct',
      group: 'Phi',
      temperature: 0.7,
      defaultEnabled: true
    },
    {
      id: 'microsoft/phi-3-medium-128k-instruct:free',
      provider: 'openrouter',
      name: 'Phi-3 Medium 128K Instruct',
      group: 'Phi',
      temperature: 0.7,
      defaultEnabled: true
    },
    {
      id: 'meta-llama/llama-3-8b-instruct:free',
      provider: 'openrouter',
      name: 'Meta: Llama 3 8B Instruct',
      group: 'Llama3',
      temperature: 0.7,
      defaultEnabled: true
    },
    {
      id: 'mistralai/mistral-7b-instruct:free',
      provider: 'openrouter',
      name: 'Mistral: Mistral 7B Instruct',
      group: 'Mistral',
      temperature: 0.7,
      defaultEnabled: true
    }
  ],
  groq: [
    {
      id: 'llama3-8b-8192',
      provider: 'groq',
      name: 'LLaMA3 8B',
      group: 'Llama3',
      temperature: 0.7,
      defaultEnabled: false
    },
    {
      id: 'llama3-70b-8192',
      provider: 'groq',
      name: 'LLaMA3 70B',
      group: 'Llama3',
      temperature: 0.7,
      defaultEnabled: true
    },
    {
      id: 'mixtral-8x7b-32768',
      provider: 'groq',
      name: 'Mixtral 8x7B',
      group: 'Mixtral',
      temperature: 0.7,
      defaultEnabled: false
    },
    {
      id: 'gemma-7b-it',
      provider: 'groq',
      name: 'Gemma 7B',
      group: 'Gemma',
      temperature: 0.7,
      defaultEnabled: false
    }
  ]
}
