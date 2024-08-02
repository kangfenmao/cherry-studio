/// <reference types="vite/client" />

import type KeyvStorage from '@kangfenmao/keyv-storage'
import { MessageInstance } from 'antd/es/message/interface'
import { HookAPI } from 'antd/es/modal/useModal'

declare global {
  interface Window {
    message: MessageInstance
    modal: HookAPI
    keyv: KeyvStorage
    mermaid: any
  }
}
