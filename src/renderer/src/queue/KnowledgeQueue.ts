import { AddLoaderReturn } from '@llm-tools/embedjs-interfaces'
import db from '@renderer/databases'
import { getRagAppRequestParams } from '@renderer/services/KnowledgeService'
import store from '@renderer/store'
import { removeProcessingItem, updateBaseItemUniqueId, updateProcessingStatus } from '@renderer/store/knowledge'
import { ProcessingItem } from '@renderer/types'

class KnowledgeQueue {
  private processing: Map<string, boolean> = new Map()
  private pollingInterval: NodeJS.Timeout | null = null
  private readonly POLLING_INTERVAL = 5000
  private readonly MAX_RETRIES = 3

  constructor() {
    this.checkAllBases().catch(console.error)
    this.startPolling()
  }

  private startPolling(): void {
    if (this.pollingInterval) return

    const state = store.getState()
    state.knowledge.bases.forEach((base) => {
      base.processingQueue.forEach((item) => {
        if (item.status === 'processing') {
          store.dispatch(
            updateProcessingStatus({
              baseId: base.id,
              itemId: item.id,
              status: 'pending',
              progress: 0
            })
          )
        }
      })
    })

    this.pollingInterval = setInterval(() => {
      this.checkAllBases()
    }, this.POLLING_INTERVAL)
  }

  private stopPolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval)
      this.pollingInterval = null
    }
  }

  private async checkAllBases(): Promise<void> {
    const state = store.getState()
    const bases = state.knowledge.bases

    console.log('[KnowledgeQueue] Checking all bases for pending items...')

    await Promise.all(
      bases.map(async (base) => {
        const processableItems = base.processingQueue.filter((item) => {
          if (item.status === 'failed') {
            return !item.retryCount || item.retryCount < this.MAX_RETRIES
          }
          return item.status === 'pending'
        })

        const hasProcessableItems = processableItems.length > 0

        console.log(
          `[KnowledgeQueue] Base ${base.id}: ${hasProcessableItems ? 'has processable items' : 'no processable items'}`
        )

        if (hasProcessableItems && !this.processing.get(base.id)) {
          await this.processQueue(base.id)
        }
      })
    )
  }

  async processQueue(baseId: string): Promise<void> {
    if (this.processing.get(baseId)) {
      console.log(`[KnowledgeQueue] Queue for base ${baseId} is already being processed`)
      return
    }

    this.processing.set(baseId, true)

    try {
      const state = store.getState()
      const base = state.knowledge.bases.find((b) => b.id === baseId)

      if (!base) {
        throw new Error('Knowledge base not found')
      }

      const processableItems = base.processingQueue.filter((item) => {
        if (item.status === 'failed') {
          return !item.retryCount || item.retryCount < this.MAX_RETRIES
        }
        return item.status === 'pending'
      })

      for (const item of processableItems) {
        if (!this.processing.get(baseId)) {
          console.log(`[KnowledgeQueue] Processing interrupted for base ${baseId}`)
          break
        }

        console.log(`[KnowledgeQueue] Processing item ${item.id} (${item.type}) in base ${baseId}`)
        await this.processItem(baseId, item)
      }
    } finally {
      console.log(`[KnowledgeQueue] Finished processing queue for base ${baseId}`)
      this.processing.set(baseId, false)
    }
  }

  stopProcessing(baseId: string): void {
    this.processing.set(baseId, false)
  }

  stopAllProcessing(): void {
    this.stopPolling()
    for (const baseId of this.processing.keys()) {
      this.processing.set(baseId, false)
    }
  }

  private async processItem(baseId: string, item: ProcessingItem): Promise<void> {
    try {
      if (item.retryCount && item.retryCount >= this.MAX_RETRIES) {
        console.log(`[KnowledgeQueue] Item ${item.id} has reached max retries, skipping`)
        return
      }

      console.log(`[KnowledgeQueue] Starting to process item ${item.id} (${item.type})`)
      // Update status to processing
      store.dispatch(
        updateProcessingStatus({
          baseId,
          itemId: item.id,
          status: 'processing',
          retryCount: (item.retryCount || 0) + 1
        })
      )

      const base = store.getState().knowledge.bases.find((b) => b.id === baseId)

      if (!base) {
        throw new Error(`[KnowledgeQueue] Knowledge base ${baseId} not found`)
      }

      const requestParams = getRagAppRequestParams(base)
      const sourceItem = base.items.find((i) => i.id === item.sourceId)

      if (!sourceItem) {
        throw new Error(`[KnowledgeQueue] Source item ${item.sourceId} not found in base ${baseId}`)
      }

      let result: AddLoaderReturn | null = null
      let note, content

      switch (item.type) {
        case 'file':
          console.log(`[KnowledgeQueue] Processing file: ${sourceItem.content}`)
          result = await window.api.knowledgeBase.add({ data: sourceItem.content, config: requestParams })
          console.log(`[KnowledgeQueue] Result: ${JSON.stringify(result)}`)
          break
        case 'url':
          console.log(`[KnowledgeQueue] Processing URL: ${sourceItem.content}`)
          result = await window.api.knowledgeBase.add({ data: sourceItem.content, config: requestParams })
          console.log(`[KnowledgeQueue] Result: ${JSON.stringify(result)}`)
          break
        case 'note':
          console.log(`[KnowledgeQueue] Processing note: ${sourceItem.content}`)
          note = await db.knowledge_notes.get(item.sourceId)
          if (!note) throw new Error(`Source note ${item.sourceId} not found`)
          content = note.content as string
          result = await window.api.knowledgeBase.add({ data: content, config: requestParams })
          console.log(`[KnowledgeQueue] Result: ${JSON.stringify(result)}`)
          break
      }

      console.log(`[KnowledgeQueue] Successfully completed processing item ${item.id}`)

      // Mark as completed
      store.dispatch(
        updateProcessingStatus({
          baseId,
          itemId: item.id,
          status: 'completed'
        })
      )

      // Update uniqueId
      if (result) {
        store.dispatch(
          updateBaseItemUniqueId({
            baseId,
            itemId: item.sourceId,
            uniqueId: result.uniqueId
          })
        )
      }

      console.debug(`[KnowledgeQueue] Updated uniqueId for item ${item.sourceId} in base ${baseId}`)

      // Remove from queue after successful processing
      setTimeout(() => {
        store.dispatch(removeProcessingItem({ baseId, itemId: item.id }))
      }, 1000)
    } catch (error) {
      console.error(`[KnowledgeQueue] Error processing item ${item.id}:`, error)
      store.dispatch(
        updateProcessingStatus({
          baseId,
          itemId: item.id,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
          retryCount: (item.retryCount || 0) + 1
        })
      )
    }
  }
}

export default new KnowledgeQueue()
