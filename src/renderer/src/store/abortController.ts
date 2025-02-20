export const abortMap = new Map<string, () => void>()

export const addAbortController = (messageId: string, abortFn: () => void) => {
  let callback = abortFn
  const existingCallback = abortMap.get(messageId)
  if (existingCallback) {
    callback = () => {
      existingCallback?.()
      abortFn()
    }
  }
  abortMap.set(messageId, callback)
}

export const removeAbortController = (messageId: string) => {
  abortMap.delete(messageId)
}

export const abortCompletion = (messageId: string) => {
  const abortFn = abortMap.get(messageId)
  if (abortFn) {
    abortFn()
    removeAbortController(messageId)
  }
}
