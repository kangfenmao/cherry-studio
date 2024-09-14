import { isLocalAi } from '@renderer/config/env'
import i18n from '@renderer/i18n'
import LocalStorage from '@renderer/services/storage'
import { useAppDispatch } from '@renderer/store'
import { setAvatar } from '@renderer/store/runtime'
import { runAsyncFunction } from '@renderer/utils'
import { useEffect } from 'react'

import { useDefaultModel } from './useAssistant'
import { useSettings } from './useSettings'

export function useAppInit() {
  const dispatch = useAppDispatch()
  const { proxyUrl, language } = useSettings()
  const { setDefaultModel, setTopicNamingModel, setTranslateModel } = useDefaultModel()

  useEffect(() => {
    runAsyncFunction(async () => {
      const storedImage = await LocalStorage.getImage('avatar')
      storedImage && dispatch(setAvatar(storedImage))
    })
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
    i18n.changeLanguage(language || navigator.language || 'en-US')
  }, [language])

  useEffect(() => {
    if (isLocalAi) {
      const model = JSON.parse(import.meta.env.VITE_RENDERER_INTEGRATED_MODEL)
      setDefaultModel(model)
      setTopicNamingModel(model)
      setTranslateModel(model)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
