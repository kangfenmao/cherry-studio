import { FileType, KnowledgeItem, Topic } from '@renderer/types'
import { Dexie, type EntityTable } from 'dexie'

// Database declaration (move this to its own module also)
export const db = new Dexie('CherryStudio') as Dexie & {
  files: EntityTable<FileType, 'id'>
  topics: EntityTable<Pick<Topic, 'id' | 'messages'>, 'id'>
  settings: EntityTable<{ id: string; value: any }, 'id'>
  knowledge_notes: EntityTable<KnowledgeItem, 'id'>
}

db.version(1).stores({
  files: 'id, name, origin_name, path, size, ext, type, created_at, count'
})

db.version(2).stores({
  files: 'id, name, origin_name, path, size, ext, type, created_at, count',
  topics: '&id, messages',
  settings: '&id, value'
})

db.version(3).stores({
  files: 'id, name, origin_name, path, size, ext, type, created_at, count',
  topics: '&id, messages',
  settings: '&id, value',
  knowledge_notes: '&id, baseId, type, content, created_at, updated_at'
})

export default db
