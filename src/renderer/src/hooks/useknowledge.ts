/* eslint-disable react-hooks/rules-of-hooks */
import { db } from '@renderer/databases/index'
import { RootState, useAppSelector } from '@renderer/store'
import {
  addItem,
  addProcessingItem,
  clearAllItems,
  clearCompletedItems,
  removeItem as removeItemAction,
  removeProcessingItem,
  renameBase,
  selectProcessingItemBySource,
  selectProcessingItemsByType,
  updateBase,
  updateFiles as updateFilesAction,
  updateNotes,
  updateProcessingStatus
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
  const knowledgeState = useAppSelector((state: RootState) => state.knowledge)

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
      const newItem = {
        id: uuidv4(),
        type: 'file' as const,
        content: file,
        created_at: Date.now(),
        updated_at: Date.now()
      }
      dispatch(addItem({ baseId, item: newItem }))
    }
  }

  // 添加URL
  const addUrl = (url: string) => {
    const newUrlItem = {
      id: uuidv4(),
      type: 'url' as const,
      content: url,
      created_at: Date.now(),
      updated_at: Date.now()
    }
    dispatch(addItem({ baseId, item: newUrlItem }))
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
      updated_at: Date.now()
    }

    dispatch(updateNotes({ baseId, item: noteRef }))
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
  }

  // 获取笔记内容
  const getNoteContent = async (noteId: string) => {
    return await db.knowledge_notes.get(noteId)
  }

  // 移除项目
  const removeItem = (item: KnowledgeItem) => {
    dispatch(removeItemAction({ baseId, item }))
  }

  // 添加文件到处理队列
  const addFileToQueue = (itemId: string) => {
    dispatch(
      addProcessingItem({
        baseId,
        type: 'file',
        sourceId: itemId
      })
    )
  }

  // 添加URL到处理队列
  const addUrlToQueue = (itemId: string) => {
    dispatch(
      addProcessingItem({
        baseId,
        type: 'url',
        sourceId: itemId
      })
    )
  }

  // 添加笔记到处理队列
  const addNoteToQueue = (itemId: string) => {
    dispatch(
      addProcessingItem({
        baseId,
        type: 'note',
        sourceId: itemId
      })
    )
  }

  // 更新处理状态
  const updateItemStatus = (itemId: string, status: ProcessingStatus, progress?: number, error?: string) => {
    dispatch(
      updateProcessingStatus({
        baseId,
        itemId,
        status,
        progress,
        error
      })
    )
  }

  // 获取特定源的处理状态
  const getProcessingStatus = (sourceId: string) => {
    return selectProcessingItemBySource(knowledgeState, baseId, sourceId)
  }

  // 获取特定类型的所有处理项
  const getProcessingItemsByType = (type: 'file' | 'url' | 'note') => {
    return selectProcessingItemsByType(knowledgeState, baseId, type)
  }

  // 从队列中移除项目
  const removeFromQueue = (itemId: string) => {
    dispatch(
      removeProcessingItem({
        baseId,
        itemId
      })
    )
  }

  // 清除已完成的项目
  const clearCompleted = () => {
    dispatch(clearCompletedItems({ baseId }))
  }

  // 清除所有队列项目
  const clearAll = () => {
    dispatch(clearAllItems({ baseId }))
  }

  const fileItems = base?.items.filter((item) => item.type === 'file') || []
  const urlItems = base?.items.filter((item) => item.type === 'url') || []
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
    noteItems,
    renameKnowledgeBase,
    updateKnowledgeBase,
    addFiles,
    addUrl,
    addNote,
    updateFiles,
    updateNoteContent,
    getNoteContent,
    addFileToQueue,
    addUrlToQueue,
    addNoteToQueue,
    updateItemStatus,
    getProcessingStatus,
    getProcessingItemsByType,
    removeFromQueue,
    clearCompleted,
    clearAll,
    removeItem
  }
}
