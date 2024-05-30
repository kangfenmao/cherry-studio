import { runAsyncFunction } from '@renderer/utils'
import localforage from 'localforage'
import { useEffect, useState } from 'react'

export type Conversation = {
  id: string
  name: string
  avatar: string
  lastMessage: string
  lastMessageAt: string
}

export default function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversation, setActiveConversation] = useState<Conversation>()

  // Use localforage to initialize conversations
  useEffect(() => {
    runAsyncFunction(async () => {
      const conversations = await localforage.getItem<Conversation[]>('conversations')
      conversations && setConversations(conversations)
    })
  }, [])

  // Update localforage
  useEffect(() => {
    localforage.setItem('conversations', conversations)
  }, [conversations])

  const addConversation = (conversation) => {
    setConversations([...conversations, conversation])
  }

  const removeConversation = (conversationId) => {
    setConversations(conversations.filter((c) => c.id !== conversationId))
  }

  const updateConversation = (conversation) => {
    setConversations(conversations.map((c) => (c.id === conversation.id ? conversation : c)))
  }

  return {
    conversations,
    activeConversation,
    setConversations,
    addConversation,
    removeConversation,
    updateConversation,
    setActiveConversation
  }
}
