import { FileType } from '@renderer/types'
import { Dexie, type EntityTable } from 'dexie'

// Database declaration (move this to its own module also)
export const db = new Dexie('CherryStudio') as Dexie & {
  files: EntityTable<FileType, 'id'>
}

db.version(1).stores({
  files: 'id, name, origin_name, path, size, ext, type, created_at, count'
})

export default db
