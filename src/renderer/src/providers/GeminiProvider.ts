import { GoogleGenerativeAI } from '@google/generative-ai'
import { getAssistantSettings, getDefaultModel, getTopNamingModel } from '@renderer/services/assistant'
import { EVENT_NAMES } from '@renderer/services/event'
import { Assistant, Message, Provider, Suggestion } from '@renderer/types'
import axios from 'axios'
import { isEmpty, takeRight } from 'lodash'
import OpenAI from 'openai'

import BaseProvider from './BaseProvider'

export default class GeminiProvider extends BaseProvider {
  private sdk: GoogleGenerativeAI

  constructor(provider: Provider) {
    super(provider)
    this.sdk = new GoogleGenerativeAI(provider.apiKey)
  }

  public async completions(
    messages: Message[],
    assistant: Assistant,
    onChunk: ({ text, usage }: { text?: string; usage?: OpenAI.Completions.CompletionUsage }) => void
  ) {
    const defaultModel = getDefaultModel()
    const model = assistant.model || defaultModel
    const { contextCount, maxTokens } = getAssistantSettings(assistant)

    const userMessages = takeRight(messages, contextCount + 1).map((message) => {
      return {
        role: message.role,
        content: message.content
      }
    })

    const geminiModel = this.sdk.getGenerativeModel({
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
  }

  async translate(message: Message, assistant: Assistant) {
    const defaultModel = getDefaultModel()
    const { maxTokens } = getAssistantSettings(assistant)
    const model = assistant.model || defaultModel

    const geminiModel = this.sdk.getGenerativeModel({
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

    const geminiModel = this.sdk.getGenerativeModel({
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

  public async suggestions(): Promise<Suggestion[]> {
    return []
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
      const geminiModel = this.sdk.getGenerativeModel({ model: body.model })
      const result = await geminiModel.generateContent(body.messages[0].content)
      return {
        valid: !isEmpty(result.response.text()),
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
    } catch (error) {
      return []
    }
  }
}
