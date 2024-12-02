import { isMac, isWindows } from '@renderer/config/constant'
import { isLocalAi } from '@renderer/config/env'
import db from '@renderer/databases'
import i18n from '@renderer/i18n'
import { useAppDispatch } from '@renderer/store'
import { setAvatar, setFilesPath } from '@renderer/store/runtime'
import { updateShortcut } from '@renderer/store/shortcuts'
import { runAsyncFunction } from '@renderer/utils'
import { useLiveQuery } from 'dexie-react-hooks'
import { useEffect } from 'react'

import { useDefaultModel } from './useAssistant'
import { useRuntime } from './useRuntime'
import { useSettings } from './useSettings'
import { useShortcuts } from './useShortcuts'

export function useAppInit() {
  const dispatch = useAppDispatch()
  const { proxyUrl, language, windowStyle, manualUpdateCheck, proxyMode } = useSettings()
  const { minappShow } = useRuntime()
  const { setDefaultModel, setTopicNamingModel, setTranslateModel } = useDefaultModel()
  const avatar = useLiveQuery(() => db.settings.get('image://avatar'))
  const { shortcuts } = useShortcuts()

  useEffect(() => {
    avatar?.value && dispatch(setAvatar(avatar.value))
  }, [avatar, dispatch])

  useEffect(() => {
    document.getElementById('spinner')?.remove()
    runAsyncFunction(async () => {
      const { isPackaged } = await window.api.getAppInfo()
      if (isPackaged && !manualUpdateCheck) {
        setTimeout(window.api.checkForUpdate, 3000)
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (proxyMode === 'system') {
      window.api.setProxy('system')
    } else if (proxyMode === 'custom') {
      proxyUrl && window.api.setProxy(proxyUrl)
    } else {
      window.api.setProxy('')
    }
  }, [proxyUrl, proxyMode])

  useEffect(() => {
    i18n.changeLanguage(language || navigator.language || 'en-US')
  }, [language])

  useEffect(() => {
    const transparentWindow = windowStyle === 'transparent' && isMac && !minappShow
    window.root.style.background = transparentWindow ? 'var(--navbar-background-mac)' : 'var(--navbar-background)'
  }, [windowStyle, minappShow])

  useEffect(() => {
    if (isLocalAi) {
      const model = JSON.parse(import.meta.env.VITE_RENDERER_INTEGRATED_MODEL)
      setDefaultModel(model)
      setTopicNamingModel(model)
      setTranslateModel(model)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    // set files path
    window.api.getAppInfo().then((info) => {
      dispatch(setFilesPath(info.filesPath))
    })
  }, [dispatch])

  useEffect(() => {
    if (isWindows) {
      shortcuts.forEach((shortcut) => {
        if (shortcut.shortcut[0] === 'Command') {
          shortcut.shortcut[0] = 'Ctrl'
          dispatch(updateShortcut(shortcut))
        }
      })
    }
  }, [dispatch, shortcuts])
}
