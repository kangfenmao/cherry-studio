import { createMigrate } from 'redux-persist'
import { RootState } from '.'
import { SYSTEM_MODELS } from '@renderer/config/models'

const migrate = createMigrate({
  // @ts-ignore store type is unknown
  '2': (state: RootState) => {
    return {
      ...state,
      llm: {
        ...state.llm,
        providers: [
          ...state.llm.providers,
          {
            id: 'yi',
            name: 'Yi',
            apiKey: '',
            apiHost: 'https://api.lingyiwanwu.com',
            isSystem: true,
            models: SYSTEM_MODELS.yi.filter((m) => m.defaultEnabled)
          }
        ]
      }
    }
  }
})

export default migrate
