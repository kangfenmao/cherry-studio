import { i18nInit } from '@renderer/i18n'
import LocalStorage from '@renderer/services/storage'
import { useAppDispatch } from '@renderer/store'
import { setAvatar } from '@renderer/store/runtime'
import { runAsyncFunction } from '@renderer/utils'
import { useEffect } from 'react'
import { useSettings } from './useSettings'
import { isWindows } from '@renderer/config/constant'

export function useAppInit() {
  const dispatch = useAppDispatch()
  const { proxyUrl } = useSettings()

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

  useEffect(() => {
    proxyUrl && window.api.setProxy(proxyUrl)
  }, [proxyUrl])

  useEffect(() => {
    isWindows && import('@renderer/assets/styles/scrollbar.scss')
  }, [])
}
