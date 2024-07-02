import Emittery from 'emittery'

export const EventEmitter = new Emittery()

export const EVENT_NAMES = {
  SEND_MESSAGE: 'SEND_MESSAGE',
  AI_CHAT_COMPLETION: 'AI_CHAT_COMPLETION',
  AI_AUTO_RENAME: 'AI_AUTO_RENAME',
  CLEAR_CONVERSATION: 'CLEAR_CONVERSATION'
}
