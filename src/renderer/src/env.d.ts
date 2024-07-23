/// <reference types="vite/client" />

import { MessageInstance } from 'antd/es/message/interface'
import { HookAPI } from 'antd/es/modal/useModal'
import type KeyvStorage from '@kangfenmao/keyv-storage'

declare global {
  interface Window {
    message: MessageInstance
    modal: HookAPI
    keyv: KeyvStorage
    mermaid: any
  }
}
