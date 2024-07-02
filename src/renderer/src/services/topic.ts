import { Topic } from '@renderer/types'
import { uuid } from '@renderer/utils'

export function getDefaultTopic(): Topic {
  return {
    id: uuid(),
    name: 'Default Topic',
    messages: []
  }
}
