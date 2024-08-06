import store, { useAppSelector } from '@renderer/store'
import { setOllamaKeepAliveTime } from '@renderer/store/llm'
import { useDispatch } from 'react-redux'

export function useOllamaSettings() {
  const settings = useAppSelector((state) => state.llm.settings.ollama)
  const dispatch = useDispatch()

  return { ...settings, setKeepAliveTime: (time: number) => dispatch(setOllamaKeepAliveTime(time)) }
}

export function getOllamaSettings() {
  return store.getState().llm.settings.ollama
}

export function getOllamaKeepAliveTime() {
  return store.getState().llm.settings.ollama.keepAliveTime + 'm'
}
