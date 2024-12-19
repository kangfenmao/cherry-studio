import * as fs from 'node:fs'
import path from 'node:path'

import { RAGApplication, RAGApplicationBuilder, TextLoader } from '@llm-tools/embedjs'
import { AddLoaderReturn, ExtractChunkData } from '@llm-tools/embedjs-interfaces'
import { LanceDb } from '@llm-tools/embedjs-lancedb'
import { MarkdownLoader } from '@llm-tools/embedjs-loader-markdown'
import { DocxLoader } from '@llm-tools/embedjs-loader-msoffice'
import { PdfLoader } from '@llm-tools/embedjs-loader-pdf'
import { SitemapLoader } from '@llm-tools/embedjs-loader-sitemap'
import { WebLoader } from '@llm-tools/embedjs-loader-web'
import { OpenAiEmbeddings } from '@llm-tools/embedjs-openai'
import { FileType, KnowledgeBaseParams, KnowledgeItem } from '@types'
import { app } from 'electron'

class KnowledgeService {
  private storageDir = path.join(app.getPath('userData'), 'Data', 'KnowledgeBase')

  constructor() {
    this.initStorageDir()
  }

  private initStorageDir = (): void => {
    if (!fs.existsSync(this.storageDir)) {
      fs.mkdirSync(this.storageDir, { recursive: true })
    }
  }

  private getRagApplication = async ({ id, model, apiKey, baseURL }: KnowledgeBaseParams): Promise<RAGApplication> => {
    return new RAGApplicationBuilder()
      .setModel('NO_MODEL')
      .setEmbeddingModel(
        new OpenAiEmbeddings({
          model,
          apiKey,
          configuration: { baseURL },
          dimensions: 1024
        })
      )
      .setVectorDatabase(new LanceDb({ path: path.join(this.storageDir, id) }))
      .build()
  }

  public create = async (
    _: Electron.IpcMainInvokeEvent,
    { id, model, apiKey, baseURL }: KnowledgeBaseParams
  ): Promise<void> => {
    this.getRagApplication({ id, model, apiKey, baseURL })
  }

  public reset = async (_: Electron.IpcMainInvokeEvent, { base }: { base: KnowledgeBaseParams }): Promise<void> => {
    const ragApplication = await this.getRagApplication(base)
    await ragApplication.reset()
  }

  public delete = async (_: Electron.IpcMainInvokeEvent, id: string): Promise<void> => {
    const dbPath = path.join(this.storageDir, id)
    if (fs.existsSync(dbPath)) {
      fs.rmSync(dbPath, { recursive: true })
    }
  }

  public add = async (
    _: Electron.IpcMainInvokeEvent,
    { base, item }: { base: KnowledgeBaseParams; item: KnowledgeItem }
  ): Promise<AddLoaderReturn> => {
    const ragApplication = await this.getRagApplication(base)

    if (item.type === 'url') {
      const content = item.content as string
      if (content.startsWith('http')) {
        return await ragApplication.addLoader(new WebLoader({ urlOrContent: content }))
      }
    }

    if (item.type === 'sitemap') {
      const content = item.content as string
      return await ragApplication.addLoader(new SitemapLoader({ url: content }))
    }

    if (item.type === 'note') {
      const content = item.content as string
      return await ragApplication.addLoader(new TextLoader({ text: content }))
    }

    if (item.type === 'file') {
      const file = item.content as FileType

      if (file.ext === '.pdf') {
        return await ragApplication.addLoader(new PdfLoader({ filePathOrUrl: file.path }) as any)
      }

      if (file.ext === '.docx') {
        return await ragApplication.addLoader(new DocxLoader({ filePathOrUrl: file.path }) as any)
      }

      if (file.ext.startsWith('.md')) {
        return await ragApplication.addLoader(new MarkdownLoader({ filePathOrUrl: file.path }) as any)
      }
    }

    return { entriesAdded: 0, uniqueId: '', loaderType: '' }
  }

  public remove = async (
    _: Electron.IpcMainInvokeEvent,
    { uniqueId, base }: { uniqueId: string; base: KnowledgeBaseParams }
  ): Promise<void> => {
    const ragApplication = await this.getRagApplication(base)
    await ragApplication.deleteLoader(uniqueId)
  }

  public search = async (
    _: Electron.IpcMainInvokeEvent,
    { search, base }: { search: string; base: KnowledgeBaseParams }
  ): Promise<ExtractChunkData[]> => {
    const ragApplication = await this.getRagApplication(base)
    return await ragApplication.search(search)
  }
}

export default new KnowledgeService()
