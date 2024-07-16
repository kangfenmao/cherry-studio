import { i18nInit } from '@renderer/i18n'
import LocalStorage from '@renderer/services/storage'
import { useAppDispatch } from '@renderer/store'
import { setAvatar } from '@renderer/store/runtime'
import { runAsyncFunction } from '@renderer/utils'
import { useEffect } from 'react'

export function useAppInitEffect() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    runAsyncFunction(async () => {
      const storedImage = await LocalStorage.getImage('avatar')
      storedImage && dispatch(setAvatar(storedImage))
    })
    i18nInit()
  }, [dispatch])

  useEffect(() => {
    runAsyncFunction(async () => {
      const { isPackaged } = await window.api.getAppInfo()
      isPackaged && setTimeout(window.api.checkForUpdate, 3000)
    })
  }, [])
}
