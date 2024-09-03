import { Model } from '@renderer/types'

type SystemModel = Model & { enabled: boolean }

export const SYSTEM_MODELS: Record<string, SystemModel[]> = {
  ollama: [],
  openai: [
    {
      id: 'gpt-4o',
      provider: 'openai',
      name: ' GPT-4o',
      group: 'GPT 4o',
      enabled: true
    },
    {
      id: 'gpt-4o-mini',
      provider: 'openai',
      name: ' GPT-4o-mini',
      group: 'GPT 4o',
      enabled: true
    },
    {
      id: 'gpt-4-turbo',
      provider: 'openai',
      name: ' GPT-4 Turbo',
      group: 'GPT 4',
      enabled: true
    },
    {
      id: 'gpt-4',
      provider: 'openai',
      name: ' GPT-4',
      group: 'GPT 4',
      enabled: true
    }
  ],
  gemini: [
    {
      id: 'gemini-1.5-flash',
      provider: 'gemini',
      name: 'Gemini 1.5 Flash',
      group: 'Gemini 1.5',
      enabled: true
    },
    {
      id: 'gemini-1.5-pro-exp-0801',
      provider: 'gemini',
      name: 'Gemini 1.5 Pro Experimental 0801',
      group: 'Gemini 1.5',
      enabled: true
    }
  ],
  anthropic: [
    {
      id: 'claude-3-5-sonnet-20240620',
      provider: 'anthropic',
      name: 'Claude 3.5 Sonnet',
      group: 'Claude 3.5',
      enabled: true
    },
    {
      id: 'claude-3-opus-20240229',
      provider: 'anthropic',
      name: 'Claude 3 Opus',
      group: 'Claude 3',
      enabled: true
    },
    {
      id: 'claude-3-sonnet-20240229',
      provider: 'anthropic',
      name: 'Claude 3 Sonnet',
      group: 'Claude 3',
      enabled: true
    },
    {
      id: 'claude-3-haiku-20240307',
      provider: 'anthropic',
      name: 'Claude 3 Haiku',
      group: 'Claude 3',
      enabled: true
    }
  ],
  silicon: [
    {
      id: 'Qwen/Qwen2-7B-Instruct',
      provider: 'silicon',
      name: 'Qwen2-7B-Instruct',
      group: 'Qwen2',
      enabled: true
    },
    {
      id: 'Qwen/Qwen2-1.5B-Instruct',
      provider: 'silicon',
      name: 'Qwen2-1.5B-Instruct',
      group: 'Qwen2',
      enabled: false
    },
    {
      id: 'Qwen/Qwen1.5-7B-Chat',
      provider: 'silicon',
      name: 'Qwen1.5-7B-Chat',
      group: 'Qwen1.5',
      enabled: false
    },
    {
      id: 'Qwen/Qwen2-72B-Instruct',
      provider: 'silicon',
      name: 'Qwen2-72B-Instruct',
      group: 'Qwen2',
      enabled: true
    },
    {
      id: 'Qwen/Qwen2-57B-A14B-Instruct',
      provider: 'silicon',
      name: 'Qwen2-57B-A14B-Instruct',
      group: 'Qwen2',
      enabled: false
    },
    {
      id: 'Qwen/Qwen1.5-110B-Chat',
      provider: 'silicon',
      name: 'Qwen1.5-110B-Chat',
      group: 'Qwen1.5',
      enabled: false
    },
    {
      id: 'Qwen/Qwen1.5-32B-Chat',
      provider: 'silicon',
      name: 'Qwen1.5-32B-Chat',
      group: 'Qwen1.5',
      enabled: false
    },
    {
      id: 'Qwen/Qwen1.5-14B-Chat',
      provider: 'silicon',
      name: 'Qwen1.5-14B-Chat',
      group: 'Qwen1.5',
      enabled: false
    },
    {
      id: 'deepseek-ai/DeepSeek-V2-Chat',
      provider: 'silicon',
      name: 'DeepSeek-V2-Chat',
      group: 'DeepSeek',
      enabled: false
    },
    {
      id: 'deepseek-ai/DeepSeek-Coder-V2-Instruct',
      provider: 'silicon',
      name: 'DeepSeek-Coder-V2-Instruct',
      group: 'DeepSeek',
      enabled: false
    },
    {
      id: 'deepseek-ai/deepseek-llm-67b-chat',
      provider: 'silicon',
      name: 'Deepseek-LLM-67B-Chat',
      group: 'DeepSeek',
      enabled: false
    },
    {
      id: 'THUDM/glm-4-9b-chat',
      provider: 'silicon',
      name: 'GLM-4-9B-Chat',
      group: 'GLM',
      enabled: true
    },
    {
      id: 'THUDM/chatglm3-6b',
      provider: 'silicon',
      name: 'GhatGLM3-6B',
      group: 'GLM',
      enabled: false
    },
    {
      id: '01-ai/Yi-1.5-9B-Chat-16K',
      provider: 'silicon',
      name: 'Yi-1.5-9B-Chat-16K',
      group: 'Yi',
      enabled: false
    },
    {
      id: '01-ai/Yi-1.5-6B-Chat',
      provider: 'silicon',
      name: 'Yi-1.5-6B-Chat',
      group: 'Yi',
      enabled: false
    },
    {
      id: '01-ai/Yi-1.5-34B-Chat-16K',
      provider: 'silicon',
      name: 'Yi-1.5-34B-Chat-16K',
      group: 'Yi',
      enabled: false
    }
  ],
  deepseek: [
    {
      id: 'deepseek-chat',
      provider: 'deepseek',
      name: 'DeepSeek Chat',
      group: 'DeepSeek Chat',
      enabled: true
    },
    {
      id: 'deepseek-coder',
      provider: 'deepseek',
      name: 'DeepSeek Coder',
      group: 'DeepSeek Coder',
      enabled: true
    }
  ],
  yi: [
    {
      id: 'yi-large',
      provider: 'yi',
      name: 'Yi-Large',
      group: 'Yi',
      enabled: false
    },
    {
      id: 'yi-large-turbo',
      provider: 'yi',
      name: 'Yi-Large-Turbo',
      group: 'Yi',
      enabled: true
    },
    {
      id: 'yi-large-rag',
      provider: 'yi',
      name: 'Yi-Large-Rag',
      group: 'Yi',
      enabled: false
    },
    {
      id: 'yi-medium',
      provider: 'yi',
      name: 'Yi-Medium',
      group: 'Yi',
      enabled: true
    },
    {
      id: 'yi-medium-200k',
      provider: 'yi',
      name: 'Yi-Medium-200k',
      group: 'Yi',
      enabled: false
    },
    {
      id: 'yi-spark',
      provider: 'yi',
      name: 'Yi-Spark',
      group: 'Yi',
      enabled: false
    }
  ],
  zhipu: [
    {
      id: 'glm-4',
      provider: 'zhipu',
      name: 'GLM-4',
      group: 'GLM-4',
      enabled: false
    },
    {
      id: 'glm-4-plus',
      provider: 'zhipu',
      name: 'GLM-4-Plus',
      group: 'GLM-4',
      enabled: false
    },
    {
      id: 'glm-4-air',
      provider: 'zhipu',
      name: 'GLM-4-Air',
      group: 'GLM-4',
      enabled: true
    },
    {
      id: 'glm-4-airx',
      provider: 'zhipu',
      name: 'GLM-4-AirX',
      group: 'GLM-4',
      enabled: false
    },
    {
      id: 'glm-4-flash',
      provider: 'zhipu',
      name: 'GLM-4-Flash',
      group: 'GLM-4',
      enabled: false
    },
    {
      id: 'glm-4v',
      provider: 'zhipu',
      name: 'GLM 4V',
      group: 'GLM-4v',
      enabled: false
    },
    {
      id: 'glm-4v-plus',
      provider: 'zhipu',
      name: 'GLM-4V-Plus',
      group: 'GLM-4v',
      enabled: false
    },
    {
      id: 'glm-4-alltools',
      provider: 'zhipu',
      name: 'GLM-4-AllTools',
      group: 'GLM-4-AllTools',
      enabled: false
    }
  ],
  moonshot: [
    {
      id: 'moonshot-v1-8k',
      provider: 'moonshot',
      name: 'Moonshot V1 8k',
      group: 'Moonshot V1',
      enabled: true
    },
    {
      id: 'moonshot-v1-32k',
      provider: 'moonshot',
      name: 'Moonshot V1 32k',
      group: 'Moonshot V1',
      enabled: true
    },
    {
      id: 'moonshot-v1-128k',
      provider: 'moonshot',
      name: 'Moonshot V1 128k',
      group: 'Moonshot V1',
      enabled: true
    }
  ],
  baichuan: [
    {
      id: 'Baichuan4',
      provider: 'baichuan',
      name: 'Baichuan4',
      group: 'Baichuan4',
      enabled: true
    },
    {
      id: 'Baichuan3-Turbo',
      provider: 'baichuan',
      name: 'Baichuan3 Turbo',
      group: 'Baichuan3',
      enabled: true
    },
    {
      id: 'Baichuan3-Turbo-128k',
      provider: 'baichuan',
      name: 'Baichuan3 Turbo 128k',
      group: 'Baichuan3',
      enabled: true
    }
  ],
  dashscope: [
    {
      id: 'qwen-turbo',
      provider: 'dashscope',
      name: 'Qwen Turbo',
      group: 'Qwen',
      enabled: true
    },
    {
      id: 'qwen-plus',
      provider: 'dashscope',
      name: 'Qwen Plus',
      group: 'Qwen',
      enabled: true
    },
    {
      id: 'qwen-max',
      provider: 'dashscope',
      name: 'Qwen Max',
      group: 'Qwen',
      enabled: true
    }
  ],
  stepfun: [
    {
      id: 'step-1-8k',
      provider: 'stepfun',
      name: 'Step 1 8K',
      group: 'Step 1',
      enabled: true
    },
    {
      id: 'step-1-flash',
      provider: 'stepfun',
      name: 'Step 1 Flash',
      group: 'Step 1',
      enabled: true
    }
  ],
  doubao: [],
  minimax: [
    {
      id: 'abab6.5s-chat',
      provider: 'minimax',
      name: 'abab6.5s',
      group: 'abab6',
      enabled: true
    },
    {
      id: 'abab6.5g-chat',
      provider: 'minimax',
      name: 'abab6.5g',
      group: 'abab6',
      enabled: true
    },
    {
      id: 'abab6.5t-chat',
      provider: 'minimax',
      name: 'abab6.5t',
      group: 'abab6',
      enabled: true
    },
    {
      id: 'abab5.5s-chat',
      provider: 'minimax',
      name: 'abab5.5s',
      group: 'abab5',
      enabled: true
    }
  ],
  aihubmix: [
    {
      id: 'gpt-4o-mini',
      provider: 'aihubmix',
      name: 'GPT-4o Mini',
      group: 'GPT-4o',
      enabled: true
    },
    {
      id: 'aihubmix-Llama-3-70B-Instruct',
      provider: 'aihubmix',
      name: 'Llama 3 70B Instruct',
      group: 'Llama3',
      enabled: true
    }
  ],
  openrouter: [
    {
      id: 'google/gemma-2-9b-it:free',
      provider: 'openrouter',
      name: 'Google: Gemma 2 9B',
      group: 'Gemma',
      enabled: true
    },
    {
      id: 'microsoft/phi-3-mini-128k-instruct:free',
      provider: 'openrouter',
      name: 'Phi-3 Mini 128K Instruct',
      group: 'Phi',
      enabled: true
    },
    {
      id: 'microsoft/phi-3-medium-128k-instruct:free',
      provider: 'openrouter',
      name: 'Phi-3 Medium 128K Instruct',
      group: 'Phi',
      enabled: true
    },
    {
      id: 'meta-llama/llama-3-8b-instruct:free',
      provider: 'openrouter',
      name: 'Meta: Llama 3 8B Instruct',
      group: 'Llama3',
      enabled: true
    },
    {
      id: 'mistralai/mistral-7b-instruct:free',
      provider: 'openrouter',
      name: 'Mistral: Mistral 7B Instruct',
      group: 'Mistral',
      enabled: true
    }
  ],
  groq: [
    {
      id: 'llama3-8b-8192',
      provider: 'groq',
      name: 'LLaMA3 8B',
      group: 'Llama3',
      enabled: false
    },
    {
      id: 'llama3-70b-8192',
      provider: 'groq',
      name: 'LLaMA3 70B',
      group: 'Llama3',
      enabled: true
    },
    {
      id: 'mixtral-8x7b-32768',
      provider: 'groq',
      name: 'Mixtral 8x7B',
      group: 'Mixtral',
      enabled: false
    },
    {
      id: 'gemma-7b-it',
      provider: 'groq',
      name: 'Gemma 7B',
      group: 'Gemma',
      enabled: false
    }
  ]
}
