import { useAppSelector } from '@renderer/store'

export default function useAvatar() {
  return useAppSelector((state) => state.runtime.avatar)
}
