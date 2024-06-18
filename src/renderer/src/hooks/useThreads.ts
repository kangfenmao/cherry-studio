import { useAppDispatch, useAppSelector } from '@renderer/store'
import {
  addConversationToThread,
  addThread,
  removeConversationFromThread,
  removeThread,
  updateThread
} from '@renderer/store/threads'
import { Thread } from '@renderer/types'
import { useState } from 'react'

export default function useThreads() {
  const { threads } = useAppSelector((state) => state.threads)
  const [threadId, setThreadId] = useState(threads[0]?.id)
  const dispatch = useAppDispatch()

  return {
    threads,
    thread: threads.find((t) => t.id === threadId),
    setThread: (thread: Thread) => setThreadId(thread.id),
    addThread: (thread: Thread) => dispatch(addThread(thread)),
    removeThread: (id: string) => dispatch(removeThread({ id })),
    updateThread: (thread: Thread) => dispatch(updateThread(thread)),
    addConversation: (threadId: string, conversationId: string) => {
      dispatch(addConversationToThread({ threadId, conversationId }))
    },
    removeConversation: (threadId: string, conversationId: string) => {
      dispatch(removeConversationFromThread({ threadId, conversationId }))
    }
  }
}
