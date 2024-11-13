import * as fs from 'node:fs'
import path from 'node:path'

import { RAGApplication, RAGApplicationBuilder, TextLoader } from '@llm-tools/embedjs'
import { AddLoaderReturn, ExtractChunkData } from '@llm-tools/embedjs-interfaces'
import { LanceDb } from '@llm-tools/embedjs-lancedb'
import { MarkdownLoader } from '@llm-tools/embedjs-loader-markdown'
import { DocxLoader } from '@llm-tools/embedjs-loader-msoffice'
import { PdfLoader } from '@llm-tools/embedjs-loader-pdf'
import { WebLoader } from '@llm-tools/embedjs-loader-web'
import { OpenAiEmbeddings } from '@llm-tools/embedjs-openai'
import { FileType, RagAppRequestParams } from '@types'
import { app } from 'electron'
import Logger from 'electron-log'

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

  private getRagApplication = async ({ id, model, apiKey, baseURL }: RagAppRequestParams): Promise<RAGApplication> => {
    Logger.log('getRagApplication', { id, model, apiKey, baseURL })
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
    { id, model, apiKey, baseURL }: RagAppRequestParams
  ): Promise<void> => {
    this.getRagApplication({ id, model, apiKey, baseURL })
  }

  public reset = async (_: Electron.IpcMainInvokeEvent, { config }: { config: RagAppRequestParams }): Promise<void> => {
    const ragApplication = await this.getRagApplication(config)
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
    { data, config }: { data: string | FileType; config: RagAppRequestParams }
  ): Promise<AddLoaderReturn> => {
    const ragApplication = await this.getRagApplication(config)

    if (typeof data === 'string') {
      if (data.startsWith('http')) {
        return await ragApplication.addLoader(new WebLoader({ urlOrContent: data }))
      }
      return await ragApplication.addLoader(new TextLoader({ text: data }))
    }

    if (data.ext === '.pdf') {
      return await ragApplication.addLoader(new PdfLoader({ filePathOrUrl: data.path }) as any)
    }

    if (data.ext === '.docx') {
      return await ragApplication.addLoader(new DocxLoader({ filePathOrUrl: data.path }) as any)
    }

    if (data.ext === '.md') {
      return await ragApplication.addLoader(new MarkdownLoader({ filePathOrUrl: data.path }) as any)
    }

    return { entriesAdded: 0, uniqueId: '', loaderType: '' }
  }

  public remove = async (
    _: Electron.IpcMainInvokeEvent,
    { uniqueId, config }: { uniqueId: string; config: RagAppRequestParams }
  ): Promise<void> => {
    const ragApplication = await this.getRagApplication(config)
    await ragApplication.deleteLoader(uniqueId)
  }

  public search = async (
    _: Electron.IpcMainInvokeEvent,
    { search, config }: { search: string; config: RagAppRequestParams }
  ): Promise<ExtractChunkData[]> => {
    const ragApplication = await this.getRagApplication(config)
    return await ragApplication.search(search)
  }
}

export default new KnowledgeService()
