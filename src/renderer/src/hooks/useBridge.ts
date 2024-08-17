import { useEffect } from 'react'

export function useBridge() {
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      const targetOrigin = { targetOrigin: '*' }

      try {
        if (event.origin !== 'file://') {
          return
        }

        const { type, method, args, id } = event.data

        if (type !== 'api-call' || !window.api) {
          return
        }

        const apiMethod = window.api[method]

        if (typeof apiMethod !== 'function') {
          return
        }

        event.source?.postMessage(
          {
            id,
            type: 'api-response',
            result: await apiMethod(...args)
          },
          targetOrigin
        )
      } catch (error) {
        event.source?.postMessage(
          {
            id: event.data?.id,
            type: 'api-response',
            error: error instanceof Error ? error.message : String(error)
          },
          targetOrigin
        )
      }
    }

    window.addEventListener('message', handleMessage)

    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [])
}
