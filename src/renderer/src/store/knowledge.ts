import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import FileManager from '@renderer/services/FileManager'
import { getRagAppRequestParams } from '@renderer/services/KnowledgeService'
import { FileType, KnowledgeBase, KnowledgeItem, ProcessingItem, ProcessingStatus } from '@renderer/types'

export interface KnowledgeState {
  bases: KnowledgeBase[]
}

const initialState: KnowledgeState = {
  bases: []
}

const knowledgeSlice = createSlice({
  name: 'knowledge',
  initialState,
  reducers: {
    // 添加知识库
    addBase(state, action: PayloadAction<KnowledgeBase>) {
      state.bases.push(action.payload)
    },

    // 删除知识库
    deleteBase(state, action: PayloadAction<{ baseId: string }>) {
      const base = state.bases.find((b) => b.id === action.payload.baseId)
      if (base) {
        state.bases = state.bases.filter((b) => b.id !== action.payload.baseId)
        const files = base.items.filter((item) => item.type === 'file')
        FileManager.deleteFiles(files.map((item) => item.content) as FileType[])
        window.api.knowledgeBase.delete(action.payload.baseId)
      }
    },

    // 重命名知识库
    renameBase(state, action: PayloadAction<{ baseId: string; name: string }>) {
      const base = state.bases.find((b) => b.id === action.payload.baseId)
      if (base) {
        base.name = action.payload.name
        base.updated_at = Date.now()
      }
    },

    // 更新知识库
    updateBase(state, action: PayloadAction<KnowledgeBase>) {
      const index = state.bases.findIndex((b) => b.id === action.payload.id)
      if (index !== -1) {
        state.bases[index] = action.payload
      }
    },

    // 添加条目
    addItem(state, action: PayloadAction<{ baseId: string; item: KnowledgeItem }>) {
      const base = state.bases.find((b) => b.id === action.payload.baseId)
      if (base) {
        if (action.payload.item.type === 'note') {
          base.items.push(action.payload.item)
        } else if (action.payload.item.type === 'url') {
          const urlExists = base.items.some((item) => item.content === action.payload.item.content)
          if (!urlExists) {
            base.items.push(action.payload.item)
          }
        } else if (action.payload.item.type === 'file') {
          action.payload.item.created_at = new Date(action.payload.item.created_at).getTime()
          action.payload.item.updated_at = new Date(action.payload.item.updated_at).getTime()
          base.items.push(action.payload.item)
        }
        base.updated_at = Date.now()
      }
    },

    // 删除条目
    removeItem(state, action: PayloadAction<{ baseId: string; item: KnowledgeItem }>) {
      const { baseId, item } = action.payload
      const base = state.bases.find((b) => b.id === baseId)
      if (base) {
        base.items = base.items.filter((item) => item.id !== action.payload.item.id)
        base.updated_at = Date.now()
        if (item?.uniqueId) {
          window.api.knowledgeBase.remove({
            uniqueId: item.uniqueId,
            config: getRagAppRequestParams(base)
          })
        }
        if (item.type === 'file' && typeof item.content === 'object') {
          FileManager.deleteFile(item.content.id)
        }
      }
    },

    // 更新文件
    updateFiles(state, action: PayloadAction<{ baseId: string; items: KnowledgeItem[] }>) {
      const base = state.bases.find((b) => b.id === action.payload.baseId)
      if (base) {
        // 保留非文件类型的项目
        const nonFileItems = base.items.filter((item) => item.type !== 'file')
        base.items = [...nonFileItems, ...action.payload.items]
        base.updated_at = Date.now()
      }
    },

    // 更新笔记
    updateNotes(state, action: PayloadAction<{ baseId: string; item: KnowledgeItem }>) {
      const base = state.bases.find((b) => b.id === action.payload.baseId)
      if (base) {
        const existingNoteIndex = base.items.findIndex(
          (item) => item.type === 'note' && item.id === action.payload.item.id
        )
        if (existingNoteIndex !== -1) {
          base.items[existingNoteIndex] = action.payload.item
        } else {
          base.items.push(action.payload.item)
        }
        base.updated_at = Date.now()
      }
    },

    // 添加处理队列项
    addProcessingItem(
      state,
      action: PayloadAction<{ baseId: string; type: 'file' | 'url' | 'note'; sourceId: string }>
    ) {
      const base = state.bases.find((b) => b.id === action.payload.baseId)
      if (base) {
        const newItem: ProcessingItem = {
          id: `${action.payload.type}-${action.payload.sourceId}`,
          type: action.payload.type,
          sourceId: action.payload.sourceId,
          status: 'pending',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          baseId: action.payload.baseId
        }

        // 避免重复添加
        const exists = base.processingQueue.some((item) => item.sourceId === action.payload.sourceId)
        if (!exists) {
          base.processingQueue.push(newItem)
        }
      }
    },

    // 更新处理状态
    updateProcessingStatus(
      state,
      action: PayloadAction<{
        baseId: string
        itemId: string
        status: ProcessingStatus
        progress?: number
        error?: string
        retryCount?: number
      }>
    ) {
      const base = state.bases.find((b) => b.id === action.payload.baseId)
      if (base) {
        const item = base.processingQueue.find((item) => item.id === action.payload.itemId)
        if (item) {
          item.status = action.payload.status
          item.progress = action.payload.progress
          item.error = action.payload.error
          item.retryCount = action.payload.retryCount
          item.updatedAt = Date.now()
        }
      }
    },

    // 移除处理队列项
    removeProcessingItem(state, action: PayloadAction<{ baseId: string; itemId: string }>) {
      const base = state.bases.find((b) => b.id === action.payload.baseId)
      if (base) {
        base.processingQueue = base.processingQueue.filter((item) => item.id !== action.payload.itemId)
      }
    },

    // 清除已完成的项目
    clearCompletedItems(state, action: PayloadAction<{ baseId: string }>) {
      const base = state.bases.find((b) => b.id === action.payload.baseId)
      if (base) {
        base.processingQueue = base.processingQueue.filter(
          (item) => item.status !== 'completed' && item.status !== 'failed'
        )
      }
    },

    // 清除所有队列项目
    clearAllItems(state, action: PayloadAction<{ baseId: string }>) {
      const base = state.bases.find((b) => b.id === action.payload.baseId)
      if (base) {
        base.processingQueue = []
      }
    },

    // 更新知识库单个条目下面的 uniqueId
    updateBaseItemUniqueId(state, action: PayloadAction<{ baseId: string; itemId: string; uniqueId: string }>) {
      const base = state.bases.find((b) => b.id === action.payload.baseId)
      if (base) {
        const item = base.items.find((item) => item.id === action.payload.itemId)
        if (item) {
          item.uniqueId = action.payload.uniqueId
        }
      }
    }
  }
})

// Selectors
export const selectProcessingItemBySource = (
  state: KnowledgeState,
  baseId: string,
  sourceId: string
): ProcessingItem | undefined => {
  const base = state.bases.find((b) => b.id === baseId)
  return base?.processingQueue.find((item) => item.sourceId === sourceId)
}

export const selectProcessingItemsByType = (
  state: KnowledgeState,
  baseId: string,
  type: 'file' | 'url' | 'note'
): ProcessingItem[] => {
  const base = state.bases.find((b) => b.id === baseId)
  return base?.processingQueue.filter((item) => item.type === type) || []
}

export const {
  addBase,
  deleteBase,
  renameBase,
  updateBase,
  addItem,
  updateFiles,
  updateNotes,
  removeItem,
  addProcessingItem,
  updateProcessingStatus,
  removeProcessingItem,
  clearCompletedItems,
  clearAllItems,
  updateBaseItemUniqueId
} = knowledgeSlice.actions

export default knowledgeSlice.reducer
