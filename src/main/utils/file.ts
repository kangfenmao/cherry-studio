import { audioExts, documentExts, imageExts, textExts, videoExts } from '@main/constant'

import { FileTypes } from '../../renderer/src/types'

export function getFileType(ext: string): FileTypes {
  ext = ext.toLowerCase()
  if (imageExts.includes(ext)) return FileTypes.IMAGE
  if (videoExts.includes(ext)) return FileTypes.VIDEO
  if (audioExts.includes(ext)) return FileTypes.AUDIO
  if (textExts.includes(ext)) return FileTypes.TEXT
  if (documentExts.includes(ext)) return FileTypes.DOCUMENT
  return FileTypes.OTHER
}
