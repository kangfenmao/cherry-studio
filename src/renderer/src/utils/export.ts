import db from '@renderer/databases'
import { Message, Topic } from '@renderer/types'

export const exportMessageAsMarkdown = (message: Message) => {
  if (message.role === 'user') {
    return `### User\n\n${message.content}`
  }

  return `### Assistant\n\n${message.content}`
}

export const exportMessagesAsMarkdown = (messages: Message[]) => {
  return messages.map((message) => exportMessageAsMarkdown(message)).join('\n\n---\n\n')
}

export const exportTopicAsMarkdown = async (topic: Topic) => {
  const fileName = topic.name + '.md'
  const topicMessages = await db.topics.get(topic.id)
  if (topicMessages) {
    const title = '# ' + topic.name + `\n\n`
    const markdown = exportMessagesAsMarkdown(topicMessages.messages)
    window.api.file.save(fileName, title + markdown)
  }
}
