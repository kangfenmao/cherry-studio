import db from '@renderer/databases'
import { Message, Topic } from '@renderer/types'

export const messageToMarkdown = (message: Message) => {
  const roleText = message.role === 'user' ? '🧑‍💻 User' : '🤖 Assistant'
  const titleSection = `### ${roleText}`
  const contentSection = message.content

  return [titleSection, '', contentSection].join('\n')
}

export const messagesToMarkdown = (messages: Message[]) => {
  return messages.map((message) => messageToMarkdown(message)).join('\n\n---\n\n')
}

export const topicToMarkdown = async (topic: Topic) => {
  const topicName = `# ${topic.name}`
  const topicMessages = await db.topics.get(topic.id)

  if (topicMessages) {
    return topicName + '\n\n' + messagesToMarkdown(topicMessages.messages)
  }

  return ''
}

export const exportTopicAsMarkdown = async (topic: Topic) => {
  const fileName = topic.name + '.md'
  const markdown = await topicToMarkdown(topic)
  window.api.file.save(fileName, markdown)
}
