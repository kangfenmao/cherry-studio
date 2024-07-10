import OpenAiProviderLogo from '@renderer/assets/images/providers/openai.jpeg'
import SiliconFlowProviderLogo from '@renderer/assets/images/providers/silicon.png'
import DeepSeekProviderLogo from '@renderer/assets/images/providers/deepseek.png'
import YiProviderLogo from '@renderer/assets/images/providers/yi.svg'
import GroqProviderLogo from '@renderer/assets/images/providers/groq.png'
import ZhipuProviderLogo from '@renderer/assets/images/providers/zhipu.png'
import OllamaProviderLogo from '@renderer/assets/images/providers/ollama.png'
import ChatGPTModelLogo from '@renderer/assets/images/models/chatgpt.jpeg'
import ChatGLMModelLogo from '@renderer/assets/images/models/chatglm.jpeg'
import DeepSeekModelLogo from '@renderer/assets/images/models/deepseek.png'
import GemmaModelLogo from '@renderer/assets/images/models/gemma.jpeg'
import QwenModelLogo from '@renderer/assets/images/models/qwen.jpeg'
import YiModelLogo from '@renderer/assets/images/models/yi.svg'
import LlamaModelLogo from '@renderer/assets/images/models/llama.jpeg'
import MixtralModelLogo from '@renderer/assets/images/models/mixtral.jpeg'

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
    default:
      return ''
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
    mixtral: MixtralModelLogo
  }

  for (const key in logoMap) {
    if (modelId.toLowerCase().includes(key)) {
      return logoMap[key]
    }
  }

  return ''
}
