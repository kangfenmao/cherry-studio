import { Model } from '@renderer/types'

export const SYSTEM_MODELS: Record<string, Model[]> = {
  openai: [
    {
      id: 'gpt-3.5-turbo',
      name: 'gpt-3.5-turbo',
      group: 'GPT 3.5',
      temperature: 0.7
    },
    {
      id: 'gpt-3.5-turbo-0301',
      name: 'gpt-3.5-turbo',
      group: 'GPT 3.5',
      temperature: 0.3
    },
    {
      id: 'gpt-4',
      name: 'gpt-4',
      group: 'GPT 4',
      temperature: 0.7
    },
    {
      id: 'gpt-4-0314',
      name: 'gpt-4',
      group: 'GPT 4',
      temperature: 0.3
    },
    {
      id: 'gpt-4-32k',
      name: 'gpt-4-32k',
      group: 'GPT 4',
      temperature: 0.7
    },
    {
      id: 'gpt-4-32k-0314',
      name: 'gpt-4-32k',
      group: 'GPT 4',
      temperature: 0.3
    }
  ],
  silicon: [
    {
      id: 'deepseek-ai/DeepSeek-V2-Chat',
      name: 'DeepSeek-V2-Chat',
      group: 'DeepSeek',
      temperature: 0.7
    },
    {
      id: 'deepseek-ai/DeepSeek-Coder-V2-Instruct',
      name: 'DeepSeek-Coder-V2-Instruct',
      group: 'DeepSeek',
      temperature: 0.7
    },
    {
      id: 'deepseek-ai/deepseek-llm-67b-chat',
      name: 'deepseek-llm-67b-chat',
      group: 'DeepSeek',
      temperature: 0.7
    },
    {
      id: 'google/gemma-2-27b-it',
      name: 'gemma-2-27b-it',
      group: 'Gemma',
      temperature: 0.7
    },
    {
      id: 'google/gemma-2-9b-it',
      name: 'gemma-2-9b-it',
      group: 'Gemma',
      temperature: 0.7
    },
    {
      id: 'Qwen/Qwen2-7B-Instruct',
      name: 'Qwen2-7B-Instruct',
      group: 'Qwen2',
      temperature: 0.7
    },
    {
      id: 'Qwen/Qwen2-1.5B-Instruct',
      name: 'Qwen2-1.5B-Instruct',
      group: 'Qwen2',
      temperature: 0.7
    },
    {
      id: 'Qwen/Qwen1.5-7B-Chat',
      name: 'Qwen1.5-7B-Chat',
      group: 'Qwen1.5',
      temperature: 0.7
    },
    {
      id: 'Qwen/Qwen2-72B-Instruct',
      name: 'Qwen2-72B-Instruct',
      group: 'Qwen2',
      temperature: 0.7
    },
    {
      id: 'Qwen/Qwen2-57B-A14B-Instruct',
      name: 'Qwen2-57B-A14B-Instruct',
      group: 'Qwen2',
      temperature: 0.7
    },
    {
      id: 'Qwen/Qwen1.5-110B-Chat',
      name: 'Qwen1.5-110B-Chat',
      group: 'Qwen1.5',
      temperature: 0.7
    },
    {
      id: 'Qwen/Qwen1.5-32B-Chat',
      name: 'Qwen1.5-32B-Chat',
      group: 'Qwen1.5',
      temperature: 0.7
    },
    {
      id: 'Qwen/Qwen1.5-14B-Chat',
      name: 'Qwen1.5-14B-Chat',
      group: 'Qwen1.5',
      temperature: 0.7
    },
    {
      id: 'THUDM/glm-4-9b-chat',
      name: 'glm-4-9b-chat',
      group: 'GLM',
      temperature: 0.7
    },
    {
      id: 'THUDM/chatglm3-6b',
      name: 'chatglm3-6b',
      group: 'GLM',
      temperature: 0.7
    },
    {
      id: '01-ai/Yi-1.5-9B-Chat-16K',
      name: 'Yi-1.5-9B-Chat-16K',
      group: 'Yi',
      temperature: 0.7
    },
    {
      id: '01-ai/Yi-1.5-6B-Chat',
      name: 'Yi-1.5-6B-Chat',
      group: 'Yi',
      temperature: 0.7
    },
    {
      id: '01-ai/Yi-1.5-34B-Chat-16K',
      name: 'Yi-1.5-34B-Chat-16K',
      group: 'Yi',
      temperature: 0.7
    },
    {
      id: 'OpenAI/GPT-4o',
      name: 'GPT-4o',
      group: 'OpenAI',
      temperature: 0.7
    },
    {
      id: 'OpenAI/GPT-3.5 Turbo',
      name: 'GPT-3.5 Turbo',
      group: 'OpenAI',
      temperature: 0.7
    },
    {
      id: 'Anthropic/claude-3-5-sonnet',
      name: 'claude-3-5-sonnet',
      group: 'Claude',
      temperature: 0.7
    },
    {
      id: 'meta-llama/Meta-Llama-3-8B-Instruct',
      name: 'Meta-Llama-3-8B-Instruct',
      group: 'Meta Llama',
      temperature: 0.7
    },
    {
      id: 'meta-llama/Meta-Llama-3-70B-Instruct',
      name: 'Meta-Llama-3-70B-Instruct',
      group: 'Meta Llama',
      temperature: 0.7
    }
  ],
  deepseek: [
    {
      id: 'deepseek-chat',
      name: 'deepseek-chat',
      group: 'Deepseek Chat',
      temperature: 0.7
    },
    {
      id: 'deepseek-coder',
      name: 'deepseek-coder',
      group: 'Deepseek Coder',
      temperature: 1.0
    }
  ],
  groq: [
    {
      id: 'llama3-8b-8192',
      name: 'LLaMA3 8b',
      group: 'Llama3',
      temperature: 0.7
    },
    {
      id: 'llama3-70b-8192',
      name: 'LLaMA3 70b',
      group: 'Llama3',
      temperature: 0.7
    },
    {
      id: 'mixtral-8x7b-32768',
      name: 'Mixtral 8x7b',
      group: 'Mixtral',
      temperature: 0.7
    },
    {
      id: 'gemma-7b-it',
      name: 'Gemma 7b',
      group: 'Gemma',
      temperature: 0.7
    }
  ]
}
