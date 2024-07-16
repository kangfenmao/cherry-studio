import { v4 as uuidv4 } from 'uuid'
import imageCompression from 'browser-image-compression'
import { Model } from '@renderer/types'

export const runAsyncFunction = async (fn: () => void) => {
  await fn()
}

/**
 * 判断字符串是否是 json 字符串
 * @param str 字符串
 */
export function isJSON(str: any): boolean {
  if (typeof str !== 'string') {
    return false
  }

  try {
    return typeof JSON.parse(str) === 'object'
  } catch (e) {
    return false
  }
}

export const delay = (seconds: number) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true)
    }, seconds * 1000)
  })
}

/**
 * Waiting fn return true
 **/
export const waitAsyncFunction = (fn: () => Promise<any>, interval = 200, stopTimeout = 60000) => {
  let timeout = false
  const timer = setTimeout(() => (timeout = true), stopTimeout)

  return (async function check(): Promise<any> {
    if (await fn()) {
      clearTimeout(timer)
      return Promise.resolve()
    } else if (!timeout) {
      return delay(interval / 1000).then(check)
    } else {
      return Promise.resolve()
    }
  })()
}

export const uuid = () => uuidv4()

export const convertToBase64 = (file: File): Promise<string | ArrayBuffer | null> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export const compressImage = async (file: File) => {
  return await imageCompression(file, {
    maxSizeMB: 1,
    maxWidthOrHeight: 300,
    useWebWorker: false
  })
}

// Converts 'gpt-3.5-turbo-16k-0613' to 'GPT-3.5-Turbo'
// Converts 'qwen2:1.5b' to 'QWEN2'
export const getDefaultGroupName = (id: string) => {
  if (id.includes(':')) {
    return id.split(':')[0].toUpperCase()
  }

  if (id.includes('-')) {
    const parts = id.split('-')
    return parts[0].toUpperCase() + '-' + parts[1].toUpperCase()
  }

  return id.toUpperCase()
}

export function droppableReorder<T>(list: T[], startIndex: number, endIndex: number, len = 1) {
  const result = Array.from(list)
  const removed = result.splice(startIndex, len)
  result.splice(endIndex, 0, ...removed)
  return result
}

// firstLetter
export const firstLetter = (str?: string) => {
  return str ? str[0] : ''
}

export function isFreeModel(model: Model) {
  return (model.id + model.name).toLocaleLowerCase().includes('free')
}

export async function isProduction() {
  const { isPackaged } = await window.api.getAppInfo()
  return isPackaged
}

export async function isDev() {
  const isProd = await isProduction()
  return !isProd
}
