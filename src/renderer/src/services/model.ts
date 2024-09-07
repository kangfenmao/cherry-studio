import { Model } from '@renderer/types'
import { pick } from 'lodash'

export const getModelUniqId = (m: Model) => {
  return JSON.stringify(pick(m, ['id', 'provider']))
}
