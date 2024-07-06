/// <reference types="vite/client" />

import { MessageInstance } from 'antd/es/message/interface'
import { HookAPI } from 'antd/es/modal/useModal'

declare global {
  interface Window {
    message: MessageInstance
    modal: HookAPI
  }
}
