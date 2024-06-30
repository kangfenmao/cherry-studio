export type Agent = {
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
  agentId: string
  conversationId: string
  createdAt: string
}

export type Conversation = {
  id: string
  messages: Message[]
}

export type User = {
  id: string
  name: string
  avatar: string
  email: string
}
