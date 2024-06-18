export type Thread = {
  id: string
  name: string
  avatar: string
  lastMessage: string
  lastMessageAt: string
  conversations: string[]
}

export type Message = {
  id: string
  content: string
  threadId: string
  conversationId: string
  createdAt: string
}

export type User = {
  id: string
  name: string
  avatar: string
  email: string
}

export type Agent = {
  id: string
  name: string
  description: string
  avatar: string
  model: string
  default: boolean
}
