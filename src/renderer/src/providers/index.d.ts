interface ChunkCallbackData {
  text?: string
  usage?: OpenAI.Completions.CompletionUsage
}

interface CompletionsParams {
  messages: Message[]
  assistant: Assistant
  onChunk: ({ text, usage }: ChunkCallbackData) => void
  onFilterMessages: (messages: Message[]) => void
}
