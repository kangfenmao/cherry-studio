import OpenAI from 'openai'

export const openaiProvider = new OpenAI({
  dangerouslyAllowBrowser: true,
  apiKey: 'sk-cmxcwkapuoxpddlytqpuxxszyqymqgrcxremulcdlgcgabtq',
  baseURL: 'https://api.siliconflow.cn/v1'
})
