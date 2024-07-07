export type Assistant = {
  id: string
  name: string
  description: string
  prompt: string
  topics: Topic[]
  model?: Model
}

export type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  assistantId: string
  topicId: string
  modelId?: string
  createdAt: string
}

export type Topic = {
  id: string
  name: string
  messages: Message[]
}

export type User = {
  id: string
  name: string
  avatar: string
  email: string
}

export type Provider = {
  id: string
  name: string
  apiKey: string
  apiHost: string
  models: Model[]
  isSystem?: boolean
}

export type Model = {
  id: string
  provider: string
  name: string
  group: string
  temperature: number
}

export type SystemAssistant = {
  id: string
  name: string
  description: string
  prompt: string
  group: string
}
