import { getAssistantById } from '@renderer/services/assistant'
import { EVENT_NAMES, EventEmitter } from '@renderer/services/event'
import { Topic } from '@renderer/types'
import { Button, Divider, Empty } from 'antd'
import { t } from 'i18next'
import { FC } from 'react'
import { useNavigate } from 'react-router'
import styled from 'styled-components'

import { default as MessageItem } from '../../home/Messages/Message'

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  topic?: Topic
}

const TopicMessages: FC<Props> = ({ topic, ...props }) => {
  const navigate = useNavigate()
  const isEmpty = (topic?.messages || []).length === 0

  if (!topic) {
    return null
  }

  const onContinueChat = (topic: Topic) => {
    const assistant = getAssistantById(topic.assistantId)
    navigate('/', { state: { assistant, topic } })
    setTimeout(() => EventEmitter.emit(EVENT_NAMES.SHOW_TOPIC_SIDEBAR), 100)
  }

  return (
    <MessagesContainer {...props}>
      <ContainerWrapper style={{ paddingTop: 30, paddingBottom: 30 }}>
        {topic?.messages.map((message) => (
          <div key={message.id}>
            <MessageItem message={message} showMenu={false} />
            <Divider style={{ margin: '10px auto' }} />
          </div>
        ))}
        {isEmpty && <Empty />}
        {!isEmpty && (
          <Button type="link" onClick={() => onContinueChat(topic)}>
            {t('history.continue_chat')}
          </Button>
        )}
      </ContainerWrapper>
    </MessagesContainer>
  )
}

const MessagesContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow-y: scroll;
`

const ContainerWrapper = styled.div`
  width: 800px;
  display: flex;
  flex-direction: column;
`

export default TopicMessages
