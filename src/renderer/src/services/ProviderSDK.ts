import { Assistant, Message, Provider } from '@renderer/types'
import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'
import { getDefaultModel, getTopNamingModel } from './assistant'
import { ChatCompletionCreateParamsNonStreaming, ChatCompletionMessageParam } from 'openai/resources'
import { sum, takeRight } from 'lodash'
import { MessageCreateParamsNonStreaming, MessageParam } from '@anthropic-ai/sdk/resources'
import { EVENT_NAMES } from './event'
import { getAssistantSettings, removeQuotes } from '@renderer/utils'

export default class ProviderSDK {
  provider: Provider
  openaiSdk: OpenAI
  anthropicSdk: Anthropic

  constructor(provider: Provider) {
    this.provider = provider
    const host = provider.apiHost
    const baseURL = host.endsWith('/') ? host : `${provider.apiHost}/v1/`
    this.anthropicSdk = new Anthropic({ apiKey: provider.apiKey, baseURL })
    this.openaiSdk = new OpenAI({ dangerouslyAllowBrowser: true, apiKey: provider.apiKey, baseURL })
  }

  private get isAnthropic() {
    return this.provider.id === 'anthropic'
  }

  public async completions(
    messages: Message[],
    assistant: Assistant,
    onChunk: ({ text, usage }: { text?: string; usage?: OpenAI.Completions.CompletionUsage }) => void
  ) {
    const defaultModel = getDefaultModel()
    const model = assistant.model || defaultModel
    const { contextCount } = getAssistantSettings(assistant)

    const systemMessage = assistant.prompt ? { role: 'system', content: assistant.prompt } : undefined

    const userMessages = takeRight(messages, contextCount + 1).map((message) => ({
      role: message.role,
      content: message.content
    }))

    if (this.isAnthropic) {
      await this.anthropicSdk.messages
        .stream({
          model: model.id,
          messages: [systemMessage, ...userMessages].filter(Boolean) as MessageParam[],
          max_tokens: 4096,
          temperature: assistant?.settings?.temperature
        })
        .on('text', (text) => onChunk({ text: text || '' }))
        .on('finalMessage', (message) =>
          onChunk({
            usage: {
              prompt_tokens: message.usage.input_tokens,
              completion_tokens: message.usage.output_tokens,
              total_tokens: sum(Object.values(message.usage))
            }
          })
        )
    } else {
      const stream = await this.openaiSdk.chat.completions.create({
        model: model.id,
        messages: [systemMessage, ...userMessages].filter(Boolean) as ChatCompletionMessageParam[],
        stream: true,
        temperature: assistant?.settings?.temperature
      })
      for await (const chunk of stream) {
        if (window.keyv.get(EVENT_NAMES.CHAT_COMPLETION_PAUSED)) break
        onChunk({ text: chunk.choices[0]?.delta?.content || '', usage: chunk.usage })
      }
    }
  }

  public async translate(message: Message, assistant: Assistant) {
    const defaultModel = getDefaultModel()
    const model = assistant.model || defaultModel
    const messages = [
      { role: 'system', content: assistant.prompt },
      { role: 'user', content: message.content }
    ]

    if (this.isAnthropic) {
      const response = await this.anthropicSdk.messages.create({
        model: model.id,
        messages: messages as MessageParam[],
        max_tokens: 4096,
        temperature: assistant?.settings?.temperature,
        stream: false
      })
      return response.content[0].type === 'text' ? response.content[0].text : ''
    } else {
      const response = await this.openaiSdk.chat.completions.create({
        model: model.id,
        messages: messages as ChatCompletionMessageParam[],
        stream: false
      })
      return response.choices[0].message?.content || ''
    }
  }

  public async summaries(messages: Message[], assistant: Assistant): Promise<string | null> {
    const model = getTopNamingModel() || assistant.model || getDefaultModel()

    const userMessages = takeRight(messages, 5).map((message) => ({
      role: 'user',
      content: message.content
    }))

    const systemMessage = {
      role: 'system',
      content: '你是一名擅长会话的助理，你需要将用户的会话总结为 10 个字以内的标题，不要使用标点符号和其他特殊符号。'
    }

    if (this.isAnthropic) {
      const message = await this.anthropicSdk.messages.create({
        messages: [systemMessage, ...userMessages] as Anthropic.Messages.MessageParam[],
        model: model.id,
        stream: false,
        max_tokens: 50
      })

      return message.content[0].type === 'text' ? message.content[0].text : null
    } else {
      const response = await this.openaiSdk.chat.completions.create({
        model: model.id,
        messages: [systemMessage, ...userMessages] as ChatCompletionMessageParam[],
        stream: false,
        max_tokens: 50
      })

      return removeQuotes(response.choices[0].message?.content || '')
    }
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
      if (this.isAnthropic) {
        const message = await this.anthropicSdk.messages.create(body as MessageCreateParamsNonStreaming)
        return { valid: message.content.length > 0, error: null }
      } else {
        const response = await this.openaiSdk.chat.completions.create(body as ChatCompletionCreateParamsNonStreaming)
        return { valid: Boolean(response?.choices[0].message), error: null }
      }
    } catch (error: any) {
      return { valid: false, error }
    }
  }

  public async models(): Promise<OpenAI.Models.Model[]> {
    try {
      if (this.isAnthropic) {
        return []
      }

      const response = await this.openaiSdk.models.list()
      return response.data
    } catch (error) {
      return []
    }
  }
}
