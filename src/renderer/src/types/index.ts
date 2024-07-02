export type Agent = {
  id: string
  name: string
  description: string
  prompt: string
  topics: Topic[]
}

export type Message = {
  id: string
  role: 'user' | 'agent'
  content: string
  agentId: string
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
