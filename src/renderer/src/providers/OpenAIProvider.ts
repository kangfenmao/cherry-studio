import { isLocalAi } from '@renderer/config/env'
import { getAssistantSettings, getDefaultModel, getTopNamingModel } from '@renderer/services/assistant'
import { EVENT_NAMES } from '@renderer/services/event'
import { filterContextMessages, filterMessages } from '@renderer/services/messages'
import { Assistant, Message, Provider, Suggestion } from '@renderer/types'
import { fileToBase64, removeQuotes } from '@renderer/utils'
import { first, takeRight } from 'lodash'
import OpenAI from 'openai'
import {
  ChatCompletionContentPart,
  ChatCompletionCreateParamsNonStreaming,
  ChatCompletionMessageParam
} from 'openai/resources'

import BaseProvider from './BaseProvider'

export default class OpenAIProvider extends BaseProvider {
  private sdk: OpenAI

  constructor(provider: Provider) {
    super(provider)
    this.sdk = new OpenAI({
      dangerouslyAllowBrowser: true,
      apiKey: provider.apiKey,
      baseURL: this.getBaseURL()
    })
  }

  private async getMessageContent(message: Message): Promise<string | ChatCompletionContentPart[]> {
    const file = first(message.files)

    if (!file) {
      return message.content
    }

    if (file.type.includes('image')) {
      return [
        { type: 'text', text: message.content },
        {
          type: 'image_url',
          image_url: {
            url: await fileToBase64(file)
          }
        }
      ]
    }

    return message.content
  }

  async completions(
    messages: Message[],
    assistant: Assistant,
    onChunk: ({ text, usage }: { text?: string; usage?: OpenAI.Completions.CompletionUsage }) => void
  ): Promise<void> {
    const defaultModel = getDefaultModel()
    const model = assistant.model || defaultModel
    const { contextCount, maxTokens } = getAssistantSettings(assistant)

    const systemMessage = assistant.prompt ? { role: 'system', content: assistant.prompt } : undefined

    const userMessages: ChatCompletionMessageParam[] = []

    for (const message of filterMessages(filterContextMessages(takeRight(messages, contextCount + 1)))) {
      userMessages.push({
        role: message.role,
        content: await this.getMessageContent(message)
      } as ChatCompletionMessageParam)
    }

    // @ts-ignore key is not typed
    const stream = await this.sdk.chat.completions.create({
      model: model.id,
      messages: [systemMessage, ...userMessages].filter(Boolean) as ChatCompletionMessageParam[],
      stream: true,
      temperature: assistant?.settings?.temperature,
      max_tokens: maxTokens,
      keep_alive: this.keepAliveTime
    })

    for await (const chunk of stream) {
      if (window.keyv.get(EVENT_NAMES.CHAT_COMPLETION_PAUSED)) break
      onChunk({ text: chunk.choices[0]?.delta?.content || '', usage: chunk.usage })
    }
  }

  async translate(message: Message, assistant: Assistant) {
    const defaultModel = getDefaultModel()
    const model = assistant.model || defaultModel
    const messages = [
      { role: 'system', content: assistant.prompt },
      { role: 'user', content: message.content }
    ]

    // @ts-ignore key is not typed
    const response = await this.sdk.chat.completions.create({
      model: model.id,
      messages: messages as ChatCompletionMessageParam[],
      stream: false,
      keep_alive: this.keepAliveTime
    })

    return response.choices[0].message?.content || ''
  }

  public async summaries(messages: Message[], assistant: Assistant): Promise<string | null> {
    const model = getTopNamingModel() || assistant.model || getDefaultModel()

    const userMessages = takeRight(messages, 5).map((message) => ({
      role: message.role,
      content: message.content
    }))

    const systemMessage = {
      role: 'system',
      content: '你是一名擅长会话的助理，你需要将用户的会话总结为 10 个字以内的标题，不要使用标点符号和其他特殊符号。'
    }

    // @ts-ignore key is not typed
    const response = await this.sdk.chat.completions.create({
      model: model.id,
      messages: [systemMessage, ...(isLocalAi ? [first(userMessages)] : userMessages)] as ChatCompletionMessageParam[],
      stream: false,
      max_tokens: 50,
      keep_alive: this.keepAliveTime
    })

    return removeQuotes(response.choices[0].message?.content?.substring(0, 50) || '')
  }

  async suggestions(messages: Message[], assistant: Assistant): Promise<Suggestion[]> {
    const model = assistant.model

    if (!model) {
      return []
    }

    const response: any = await this.sdk.request({
      method: 'post',
      path: '/advice_questions',
      body: {
        messages: messages.filter((m) => m.role === 'user').map((m) => ({ role: m.role, content: m.content })),
        model: model.id,
        max_tokens: 0,
        temperature: 0,
        n: 0
      }
    })

    return response?.questions?.filter(Boolean)?.map((q: any) => ({ content: q })) || []
  }

  public async check(): Promise<{ valid: boolean; error: Error | null }> {
    const model = this.provider.models[0]

    const body = {
      model: model.id,
      messages: [{ role: 'user', content: 'hi' }],
      max_tokens: 100,
      stream: false
    }

    try {
      const response = await this.sdk.chat.completions.create(body as ChatCompletionCreateParamsNonStreaming)

      return {
        valid: Boolean(response?.choices[0].message),
        error: null
      }
    } catch (error: any) {
      return {
        valid: false,
        error
      }
    }
  }

  public async models(): Promise<OpenAI.Models.Model[]> {
    try {
      const response = await this.sdk.models.list()
      return response.data
    } catch (error) {
      return []
    }
  }
}
