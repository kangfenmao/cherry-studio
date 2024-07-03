export type Assistant = {
  id: string
  name: string
  description: string
  prompt: string
  topics: Topic[]
}

export type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  assistantId: string
  topicId: string
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
