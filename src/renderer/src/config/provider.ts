import OpenAiProviderLogo from '@renderer/assets/images/providers/openai.jpeg'
import SiliconFlowProviderLogo from '@renderer/assets/images/providers/silicon.png'
import DeepSeekProviderLogo from '@renderer/assets/images/providers/deepseek.png'
import YiProviderLogo from '@renderer/assets/images/providers/yi.svg'
import GroqProviderLogo from '@renderer/assets/images/providers/groq.png'
import ZhipuProviderLogo from '@renderer/assets/images/providers/zhipu.png'
import OllamaProviderLogo from '@renderer/assets/images/providers/ollama.png'
import MoonshotProviderLogo from '@renderer/assets/images/providers/moonshot.jpeg'
import OpenRouterProviderLogo from '@renderer/assets/images/providers/openrouter.png'
import BaichuanProviderLogo from '@renderer/assets/images/providers/baichuan.png'
import DashScopeProviderLogo from '@renderer/assets/images/providers/dashscope.png'
import AnthropicProviderLogo from '@renderer/assets/images/providers/anthropic.jpeg'
import ChatGPTModelLogo from '@renderer/assets/images/models/chatgpt.jpeg'
import ChatGLMModelLogo from '@renderer/assets/images/models/chatglm.jpeg'
import DeepSeekModelLogo from '@renderer/assets/images/models/deepseek.png'
import GemmaModelLogo from '@renderer/assets/images/models/gemma.jpeg'
import QwenModelLogo from '@renderer/assets/images/models/qwen.jpeg'
import YiModelLogo from '@renderer/assets/images/models/yi.svg'
import LlamaModelLogo from '@renderer/assets/images/models/llama.jpeg'
import MixtralModelLogo from '@renderer/assets/images/models/mixtral.jpeg'
import MoonshotModelLogo from '@renderer/assets/images/providers/moonshot.jpeg'
import MicrosoftModelLogo from '@renderer/assets/images/models/microsoft.png'
import BaichuanModelLogo from '@renderer/assets/images/models/baichuan.png'
import ClaudeModelLogo from '@renderer/assets/images/models/claude.png'

export function getProviderLogo(providerId: string) {
  switch (providerId) {
    case 'openai':
      return OpenAiProviderLogo
    case 'silicon':
      return SiliconFlowProviderLogo
    case 'deepseek':
      return DeepSeekProviderLogo
    case 'yi':
      return YiProviderLogo
    case 'groq':
      return GroqProviderLogo
    case 'zhipu':
      return ZhipuProviderLogo
    case 'ollama':
      return OllamaProviderLogo
    case 'moonshot':
      return MoonshotProviderLogo
    case 'openrouter':
      return OpenRouterProviderLogo
    case 'baichuan':
      return BaichuanProviderLogo
    case 'dashscope':
      return DashScopeProviderLogo
    case 'anthropic':
      return AnthropicProviderLogo
    default:
      return undefined
  }
}

export function getModelLogo(modelId: string) {
  const logoMap = {
    gpt: ChatGPTModelLogo,
    glm: ChatGLMModelLogo,
    deepseek: DeepSeekModelLogo,
    qwen: QwenModelLogo,
    gemma: GemmaModelLogo,
    'yi-': YiModelLogo,
    llama: LlamaModelLogo,
    mixtral: MixtralModelLogo,
    mistral: MixtralModelLogo,
    moonshot: MoonshotModelLogo,
    phi: MicrosoftModelLogo,
    baichuan: BaichuanModelLogo,
    claude: ClaudeModelLogo
  }

  for (const key in logoMap) {
    if (modelId.toLowerCase().includes(key)) {
      return logoMap[key]
    }
  }

  return undefined
}

export const PROVIDER_CONFIG = {
  openai: {
    websites: {
      official: 'https://openai.com/',
      apiKey: 'https://platform.openai.com/api-keys',
      docs: 'https://platform.openai.com/docs',
      models: 'https://platform.openai.com/docs/models'
    }
  },
  silicon: {
    websites: {
      official: 'https://www.siliconflow.cn/',
      apiKey: 'https://cloud.siliconflow.cn/account/ak',
      docs: 'https://docs.siliconflow.cn/',
      models: 'https://docs.siliconflow.cn/docs/model-names'
    }
  },
  deepseek: {
    websites: {
      official: 'https://deepseek.com/',
      apiKey: 'https://platform.deepseek.com/api_keys',
      docs: 'https://platform.deepseek.com/api-docs/',
      models: 'https://platform.deepseek.com/api-docs/'
    }
  },
  yi: {
    websites: {
      official: 'https://platform.lingyiwanwu.com/',
      apiKey: 'https://platform.lingyiwanwu.com/apikeys',
      docs: 'https://platform.lingyiwanwu.com/docs',
      models: 'https://platform.lingyiwanwu.com/docs#%E6%A8%A1%E5%9E%8B'
    }
  },
  zhipu: {
    websites: {
      official: 'https://open.bigmodel.cn/',
      apiKey: 'https://open.bigmodel.cn/usercenter/apikeys',
      docs: 'https://open.bigmodel.cn/dev/howuse/introduction',
      models: 'https://open.bigmodel.cn/modelcenter/square'
    }
  },
  moonshot: {
    websites: {
      official: 'https://moonshot.ai/',
      apiKey: 'https://platform.moonshot.cn/console/api-keys',
      docs: 'https://platform.moonshot.cn/docs/',
      models: 'https://platform.moonshot.cn/docs/intro#%E6%A8%A1%E5%9E%8B%E5%88%97%E8%A1%A8'
    }
  },
  baichuan: {
    websites: {
      official: 'https://www.baichuan-ai.com/',
      apiKey: 'https://platform.baichuan-ai.com/console/apikey',
      docs: 'https://platform.baichuan-ai.com/docs',
      models: 'https://platform.baichuan-ai.com/price'
    }
  },
  dashscope: {
    websites: {
      official: 'https://dashscope.aliyun.com/',
      apiKey: 'https://help.aliyun.com/zh/dashscope/developer-reference/acquisition-and-configuration-of-api-key',
      docs: 'https://help.aliyun.com/zh/dashscope/',
      models: 'https://dashscope.console.aliyun.com/model'
    }
  },
  openrouter: {
    websites: {
      official: 'https://openrouter.ai/',
      apiKey: 'https://openrouter.ai/settings/keys',
      docs: 'https://openrouter.ai/docs/quick-start',
      models: 'https://openrouter.ai/docs/models'
    }
  },
  groq: {
    websites: {
      official: 'https://groq.com/',
      apiKey: 'https://console.groq.com/keys',
      docs: 'https://console.groq.com/docs/quickstart',
      models: 'https://console.groq.com/docs/models'
    }
  },
  ollama: {
    websites: {
      official: 'https://ollama.com/',
      docs: 'https://github.com/ollama/ollama/tree/main/docs',
      models: 'https://ollama.com/library'
    }
  },
  anthropic: {
    websites: {
      official: 'https://anthropic.com/',
      apiKey: 'https://console.anthropic.com/settings/keys',
      docs: 'https://docs.anthropic.com/en/docs',
      models: 'https://docs.anthropic.com/en/docs/about-claude/models'
    }
  }
}
