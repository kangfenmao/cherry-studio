/* eslint-disable react-hooks/rules-of-hooks */
import { db } from '@renderer/databases/index'
import KnowledgeQueue from '@renderer/queue/KnowledgeQueue'
import FileManager from '@renderer/services/FileManager'
import { getRagAppRequestParams } from '@renderer/services/KnowledgeService'
import { RootState } from '@renderer/store'
import {
  addBase,
  addItem,
  clearAllProcessing,
  clearCompletedProcessing,
  deleteBase,
  removeItem as removeItemAction,
  renameBase,
  updateBase,
  updateFiles as updateFilesAction,
  updateItemProcessingStatus,
  updateNotes
} from '@renderer/store/knowledge'
import { FileType, KnowledgeBase, ProcessingStatus } from '@renderer/types'
import { KnowledgeItem } from '@renderer/types'
import { runAsyncFunction } from '@renderer/utils'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { v4 as uuidv4 } from 'uuid'

export const useKnowledge = (baseId: string) => {
  const dispatch = useDispatch()
  const base = useSelector((state: RootState) => state.knowledge.bases.find((b) => b.id === baseId))

  // 重命名知识库
  const renameKnowledgeBase = (name: string) => {
    dispatch(renameBase({ baseId, name }))
  }

  // 更新知识库
  const updateKnowledgeBase = (base: KnowledgeBase) => {
    dispatch(updateBase(base))
  }

  // 添加文件列表
  const addFiles = (files: FileType[]) => {
    for (const file of files) {
      const newItem: KnowledgeItem = {
        id: uuidv4(),
        type: 'file' as const,
        content: file,
        created_at: Date.now(),
        updated_at: Date.now(),
        processingStatus: 'pending',
        processingProgress: 0,
        processingError: '',
        retryCount: 0
      }
      dispatch(addItem({ baseId, item: newItem }))
    }
    setTimeout(() => KnowledgeQueue.checkAllBases(), 0)
  }

  // 添加URL
  const addUrl = (url: string) => {
    const newUrlItem: KnowledgeItem = {
      id: uuidv4(),
      type: 'url' as const,
      content: url,
      created_at: Date.now(),
      updated_at: Date.now(),
      processingStatus: 'pending',
      processingProgress: 0,
      processingError: '',
      retryCount: 0
    }
    dispatch(addItem({ baseId, item: newUrlItem }))
    setTimeout(() => KnowledgeQueue.checkAllBases(), 0)
  }

  // 添加笔记
  const addNote = async (content: string) => {
    const noteId = uuidv4()
    const note: KnowledgeItem = {
      id: noteId,
      type: 'note',
      content,
      created_at: Date.now(),
      updated_at: Date.now()
    }

    // 存储完整笔记到数据库
    await db.knowledge_notes.add(note)

    // 在 store 中只存储引用
    const noteRef: KnowledgeItem = {
      id: noteId,
      baseId,
      type: 'note',
      content: '', // store中不需要存储实际内容
      created_at: Date.now(),
      updated_at: Date.now(),
      processingStatus: 'pending',
      processingProgress: 0,
      processingError: '',
      retryCount: 0
    }

    dispatch(updateNotes({ baseId, item: noteRef }))
    setTimeout(() => KnowledgeQueue.checkAllBases(), 0)
  }

  // 更新文件列表
  const updateFiles = (files: FileType[]) => {
    const newItems = files.map((file) => ({
      id: uuidv4(),
      type: 'file' as const,
      content: file,
      created_at: Date.now(),
      updated_at: Date.now()
    }))
    dispatch(updateFilesAction({ baseId, items: newItems }))
    setTimeout(() => KnowledgeQueue.checkAllBases(), 0)
  }

  // 更新笔记内容
  const updateNoteContent = async (noteId: string, content: string) => {
    const note = await db.knowledge_notes.get(noteId)
    if (note) {
      const updatedNote = {
        ...note,
        content,
        updated_at: Date.now()
      }
      await db.knowledge_notes.put(updatedNote)
      dispatch(updateNotes({ baseId, item: updatedNote }))
    }
    setTimeout(() => KnowledgeQueue.checkAllBases(), 0)
  }

  // 获取笔记内容
  const getNoteContent = async (noteId: string) => {
    return await db.knowledge_notes.get(noteId)
  }

  // 移除项目
  const removeItem = async (item: KnowledgeItem) => {
    dispatch(removeItemAction({ baseId, item }))
    if (base) {
      const config = getRagAppRequestParams(base)
      if (item?.uniqueId) {
        await window.api.knowledgeBase.remove({ uniqueId: item.uniqueId, config })
      }
      if (item.type === 'file' && typeof item.content === 'object') {
        await FileManager.deleteFile(item.content.id)
      }
    }
  }

  // 更新处理状态
  const updateItemStatus = (itemId: string, status: ProcessingStatus, progress?: number, error?: string) => {
    dispatch(
      updateItemProcessingStatus({
        baseId,
        itemId,
        status,
        progress,
        error
      })
    )
  }

  // 获取特定项目的处理状态
  const getProcessingStatus = (itemId: string) => {
    return base?.items.find((item) => item.id === itemId)?.processingStatus
  }

  // 获取特定类型的所有处理项
  const getProcessingItemsByType = (type: 'file' | 'url' | 'note') => {
    return base?.items.filter((item) => item.type === type && item.processingStatus !== undefined) || []
  }

  // 清除已完成的项目
  const clearCompleted = () => {
    dispatch(clearCompletedProcessing({ baseId }))
  }

  // 清除所有处理状态
  const clearAll = () => {
    dispatch(clearAllProcessing({ baseId }))
  }

  // 添加 Sitemap
  const addSitemap = (url: string) => {
    const newSitemapItem: KnowledgeItem = {
      id: uuidv4(),
      type: 'sitemap' as const,
      content: url,
      created_at: Date.now(),
      updated_at: Date.now(),
      processingStatus: 'pending',
      processingProgress: 0,
      processingError: '',
      retryCount: 0
    }
    dispatch(addItem({ baseId, item: newSitemapItem }))
    setTimeout(() => KnowledgeQueue.checkAllBases(), 0)
  }

  const fileItems = base?.items.filter((item) => item.type === 'file') || []
  const urlItems = base?.items.filter((item) => item.type === 'url') || []
  const sitemapItems = base?.items.filter((item) => item.type === 'sitemap') || []
  const [noteItems, setNoteItems] = useState<KnowledgeItem[]>([])

  useEffect(() => {
    const notes = base?.items.filter((item) => item.type === 'note') || []
    runAsyncFunction(async () => {
      const newNoteItems = await Promise.all(
        notes.map(async (item) => {
          const note = await db.knowledge_notes.get(item.id)
          return { ...item, content: note?.content || '' }
        })
      )
      setNoteItems(newNoteItems.filter((note) => note !== undefined) as KnowledgeItem[])
    })
  }, [base?.items])

  return {
    base,
    fileItems,
    urlItems,
    sitemapItems,
    noteItems,
    renameKnowledgeBase,
    updateKnowledgeBase,
    addFiles,
    addUrl,
    addSitemap,
    addNote,
    updateFiles,
    updateNoteContent,
    getNoteContent,
    updateItemStatus,
    getProcessingStatus,
    getProcessingItemsByType,
    clearCompleted,
    clearAll,
    removeItem
  }
}

export const useKnowledgeBases = () => {
  const dispatch = useDispatch()
  const bases = useSelector((state: RootState) => state.knowledge.bases)

  const addKnowledgeBase = (base: KnowledgeBase) => {
    dispatch(addBase(base))
  }

  const renameKnowledgeBase = (baseId: string, name: string) => {
    dispatch(renameBase({ baseId, name }))
  }

  const deleteKnowledgeBase = (baseId: string) => {
    dispatch(deleteBase({ baseId }))
  }

  return {
    bases,
    addKnowledgeBase,
    renameKnowledgeBase,
    deleteKnowledgeBase
  }
}
