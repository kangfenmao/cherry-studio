import { fetchTranslate } from './ApiService'
import { getDefaultTopic } from './AssistantService'
import { getDefaultTranslateAssistant } from './AssistantService'
import { getUserMessage } from './MessagesService'

export const translateText = async (text: string, targetLanguage: string) => {
  const assistant = getDefaultTranslateAssistant(targetLanguage, text)
  const message = getUserMessage({
    assistant,
    topic: getDefaultTopic('default'),
    type: 'text'
  })
  const translatedText = await fetchTranslate({ message, assistant })
  return translatedText
}
