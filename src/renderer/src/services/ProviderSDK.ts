import Anthropic from '@anthropic-ai/sdk'
import { MessageCreateParamsNonStreaming, MessageParam } from '@anthropic-ai/sdk/resources'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { DEFAULT_MAX_TOKENS } from '@renderer/config/constant'
import { isLocalAi } from '@renderer/config/env'
import { getOllamaKeepAliveTime } from '@renderer/hooks/useOllama'
import { Assistant, Message, Provider, Suggestion } from '@renderer/types'
import { removeQuotes } from '@renderer/utils'
import axios from 'axios'
import { first, isEmpty, sum, takeRight } from 'lodash'
import OpenAI from 'openai'
import { ChatCompletionCreateParamsNonStreaming, ChatCompletionMessageParam } from 'openai/resources'

import { getAssistantSettings, getDefaultModel, getTopNamingModel } from './assistant'
import { EVENT_NAMES } from './event'

export default class ProviderSDK {
  provider: Provider
  openaiSdk: OpenAI
  anthropicSdk: Anthropic
  geminiSdk: GoogleGenerativeAI

  constructor(provider: Provider) {
    this.provider = provider
    const host = provider.apiHost
    const baseURL = host.endsWith('/') ? host : `${provider.apiHost}/v1/`
    this.anthropicSdk = new Anthropic({ apiKey: provider.apiKey, baseURL })
    this.openaiSdk = new OpenAI({ dangerouslyAllowBrowser: true, apiKey: provider.apiKey, baseURL })
    this.geminiSdk = new GoogleGenerativeAI(provider.apiKey)
  }

  private get isAnthropic() {
    return this.provider.id === 'anthropic'
  }

  private get isGemini() {
    return this.provider.id === 'gemini'
  }

  private get keepAliveTime() {
    return this.provider.id === 'ollama' ? getOllamaKeepAliveTime() : undefined
  }

  public async completions(
    messages: Message[],
    assistant: Assistant,
    onChunk: ({ text, usage }: { text?: string; usage?: OpenAI.Completions.CompletionUsage }) => void
  ) {
    const defaultModel = getDefaultModel()
    const model = assistant.model || defaultModel
    const { contextCount, maxTokens } = getAssistantSettings(assistant)

    const systemMessage = assistant.prompt ? { role: 'system', content: assistant.prompt } : undefined
    const userMessages = takeRight(messages, contextCount + 1).map((message) => {
      return {
        role: message.role,
        content: message.content
      }
    })

    if (this.isAnthropic) {
      return new Promise<void>((resolve, reject) => {
        const stream = this.anthropicSdk.messages
          .stream({
            model: model.id,
            messages: userMessages.filter(Boolean) as MessageParam[],
            max_tokens: maxTokens || DEFAULT_MAX_TOKENS,
            temperature: assistant?.settings?.temperature,
            system: assistant.prompt,
            stream: true
          })
          .on('text', (text) => {
            if (window.keyv.get(EVENT_NAMES.CHAT_COMPLETION_PAUSED)) {
              resolve()
              return stream.controller.abort()
            }
            onChunk({ text })
          })
          .on('finalMessage', (message) => {
            onChunk({
              text: '',
              usage: {
                prompt_tokens: message.usage.input_tokens,
                completion_tokens: message.usage.output_tokens,
                total_tokens: sum(Object.values(message.usage))
              }
            })
            resolve()
          })
          .on('error', (error) => reject(error))
      })
    }

    if (this.isGemini) {
      const geminiModel = this.geminiSdk.getGenerativeModel({
        model: model.id,
        systemInstruction: assistant.prompt,
        generationConfig: {
          maxOutputTokens: maxTokens,
          temperature: assistant?.settings?.temperature
        }
      })

      const userLastMessage = userMessages.pop()

      const chat = geminiModel.startChat({
        history: userMessages.map((message) => ({
          role: message.role === 'user' ? 'user' : 'model',
          parts: [{ text: message.content }]
        }))
      })

      const userMessagesStream = await chat.sendMessageStream(userLastMessage?.content!)

      for await (const chunk of userMessagesStream.stream) {
        if (window.keyv.get(EVENT_NAMES.CHAT_COMPLETION_PAUSED)) break
        onChunk({
          text: chunk.text(),
          usage: {
            prompt_tokens: chunk.usageMetadata?.promptTokenCount || 0,
            completion_tokens: chunk.usageMetadata?.candidatesTokenCount || 0,
            total_tokens: chunk.usageMetadata?.totalTokenCount || 0
          }
        })
      }

      return
    }

    const _userMessages = takeRight(messages, contextCount + 1).map((message) => {
      return {
        role: message.role,
        content: message.images
          ? [
              { type: 'text', text: message.content },
              ...message.images!.map((image) => ({ type: 'image_url', image_url: image }))
            ]
          : message.content
      }
    })

    // @ts-ignore key is not typed
    const stream = await this.openaiSdk.chat.completions.create({
      model: model.id,
      messages: [systemMessage, ..._userMessages].filter(Boolean) as ChatCompletionMessageParam[],
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

  public async translate(message: Message, assistant: Assistant) {
    const defaultModel = getDefaultModel()
    const { maxTokens } = getAssistantSettings(assistant)
    const model = assistant.model || defaultModel
    const messages = [
      { role: 'system', content: assistant.prompt },
      { role: 'user', content: message.content }
    ]

    if (this.isAnthropic) {
      const response = await this.anthropicSdk.messages.create({
        model: model.id,
        messages: messages.filter((m) => m.role === 'user') as MessageParam[],
        max_tokens: 4096,
        temperature: assistant?.settings?.temperature,
        system: assistant.prompt,
        stream: false
      })

      return response.content[0].type === 'text' ? response.content[0].text : ''
    }

    if (this.isGemini) {
      const geminiModel = this.geminiSdk.getGenerativeModel({
        model: model.id,
        systemInstruction: assistant.prompt,
        generationConfig: {
          maxOutputTokens: maxTokens,
          temperature: assistant?.settings?.temperature
        }
      })

      const { response } = await geminiModel.generateContent(message.content)

      return response.text()
    }

    // @ts-ignore key is not typed
    const response = await this.openaiSdk.chat.completions.create({
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

    if (this.isAnthropic) {
      const message = await this.anthropicSdk.messages.create({
        messages: userMessages as Anthropic.Messages.MessageParam[],
        model: model.id,
        system: systemMessage.content,
        stream: false,
        max_tokens: 4096
      })

      return message.content[0].type === 'text' ? message.content[0].text : null
    }

    if (this.isGemini) {
      const geminiModel = this.geminiSdk.getGenerativeModel({
        model: model.id,
        systemInstruction: systemMessage.content,
        generationConfig: {
          temperature: assistant?.settings?.temperature
        }
      })

      const lastUserMessage = userMessages.pop()

      const chat = await geminiModel.startChat({
        history: userMessages.map((message) => ({
          role: message.role === 'user' ? 'user' : 'model',
          parts: [{ text: message.content }]
        }))
      })

      const { response } = await chat.sendMessage(lastUserMessage?.content!)

      return response.text()
    }

    // @ts-ignore key is not typed
    const response = await this.openaiSdk.chat.completions.create({
      model: model.id,
      messages: [systemMessage, ...(isLocalAi ? [first(userMessages)] : userMessages)] as ChatCompletionMessageParam[],
      stream: false,
      max_tokens: 50,
      keep_alive: this.keepAliveTime
    })

    return removeQuotes(response.choices[0].message?.content?.substring(0, 50) || '')
  }

  public async suggestions(messages: Message[], assistant: Assistant): Promise<Suggestion[]> {
    const model = assistant.model

    if (!model) {
      return []
    }

    const response: any = await this.openaiSdk.request({
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
      if (this.isAnthropic) {
        const message = await this.anthropicSdk.messages.create(body as MessageCreateParamsNonStreaming)
        return {
          valid: message.content.length > 0,
          error: null
        }
      }

      if (this.isGemini) {
        const geminiModel = this.geminiSdk.getGenerativeModel({ model: body.model })
        const result = await geminiModel.generateContent(body.messages[0].content)
        return {
          valid: !isEmpty(result.response.text()),
          error: null
        }
      }

      const response = await this.openaiSdk.chat.completions.create(body as ChatCompletionCreateParamsNonStreaming)

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
      if (this.isAnthropic) {
        return []
      }

      if (this.isGemini) {
        const api = this.provider.apiHost + '/v1beta/models'
        const { data } = await axios.get(api, { params: { key: this.provider.apiKey } })
        return data.models.map(
          (m: any) =>
            ({
              id: m.name.replace('models/', ''),
              name: m.displayName,
              description: m.description,
              object: 'model',
              created: Date.now(),
              owned_by: 'gemini'
            }) as OpenAI.Models.Model
        )
      }

      const response = await this.openaiSdk.models.list()
      return response.data
    } catch (error) {
      return []
    }
  }
}
