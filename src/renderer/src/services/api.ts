import { Assistant, Message, Provider, Topic } from '@renderer/types'
import { uuid } from '@renderer/utils'
import { EVENT_NAMES, EventEmitter } from './event'
import { ChatCompletionMessageParam, ChatCompletionSystemMessageParam } from 'openai/resources'
import OpenAI from 'openai'
import { getAssistantProvider, getDefaultModel } from './assistant'
import { takeRight } from 'lodash'
import dayjs from 'dayjs'

interface FetchChatCompletionParams {
  messages: Message[]
  topic: Topic
  assistant: Assistant
  onResponse: (message: Message) => void
}

const getOpenAiProvider = (provider: Provider) => {
  const host = provider.apiHost
  return new OpenAI({
    dangerouslyAllowBrowser: true,
    apiKey: provider.apiKey,
    baseURL: host.endsWith('/') ? host : `${provider.apiHost}/v1/`
  })
}

export async function fetchChatCompletion({ messages, topic, assistant, onResponse }: FetchChatCompletionParams) {
  const provider = getAssistantProvider(assistant)
  const openaiProvider = getOpenAiProvider(provider)
  const defaultModel = getDefaultModel()
  const model = assistant.model || defaultModel

  const _message: Message = {
    id: uuid(),
    role: 'assistant',
    content: '',
    assistantId: assistant.id,
    topicId: topic.id,
    modelId: model.id,
    createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    status: 'pending'
  }

  try {
    const stream = await openaiProvider.chat.completions.create({
      model: model.id,
      messages: [
        { role: 'system', content: assistant.prompt },
        ...takeRight(messages, 5).map((message) => ({ role: message.role, content: message.content }))
      ],
      stream: true
    })

    let content = ''

    for await (const chunk of stream) {
      content = content + (chunk.choices[0]?.delta?.content || '')
      onResponse({ ..._message, content })
    }

    _message.content = content
  } catch (error: any) {
    _message.content = `Error: ${error.message}`
  }

  _message.status = 'success'

  EventEmitter.emit(EVENT_NAMES.AI_CHAT_COMPLETION, _message)

  return _message
}

interface FetchMessagesSummaryParams {
  messages: Message[]
  assistant: Assistant
}

export async function fetchMessagesSummary({ messages, assistant }: FetchMessagesSummaryParams) {
  const provider = getAssistantProvider(assistant)
  const openaiProvider = getOpenAiProvider(provider)
  const defaultModel = getDefaultModel()
  const model = assistant.model || defaultModel

  const userMessages: ChatCompletionMessageParam[] = takeRight(messages, 5).map((message) => ({
    role: 'user',
    content: message.content
  }))

  const systemMessage: ChatCompletionSystemMessageParam = {
    role: 'system',
    content:
      '你是一名擅长会话的助理，你需要将用户的会话总结为 10 个字以内的标题，回复内容不需要用引号引起来，不需要在结尾加上句号。'
  }

  const response = await openaiProvider.chat.completions.create({
    model: model.id,
    messages: [systemMessage, ...userMessages],
    stream: false
  })

  return response.choices[0].message?.content
}
