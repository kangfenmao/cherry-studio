import { getTopicById } from '@renderer/hooks/useTopic'
import { default as MessageItem } from '@renderer/pages/home/Messages/Message'
import { getAssistantById } from '@renderer/services/assistant'
import { EVENT_NAMES, EventEmitter } from '@renderer/services/event'
import { Message } from '@renderer/types'
import { Button } from 'antd'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  message?: Message
}

const SearchMessage: FC<Props> = ({ message, ...props }) => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  if (!message) {
    return null
  }

  const onContinueChat = async (message: Message) => {
    const assistant = getAssistantById(message.assistantId)
    const topic = await getTopicById(message.topicId)
    navigate('/', { state: { assistant, topic } })
    setTimeout(() => EventEmitter.emit(EVENT_NAMES.SHOW_TOPIC_SIDEBAR), 100)
  }

  return (
    <MessagesContainer {...props}>
      <ContainerWrapper style={{ paddingTop: 30, paddingBottom: 30 }}>
        <MessageItem message={message} showMenu={false} />
        <Button type="link" onClick={() => onContinueChat(message)}>
          {t('history.continue_chat')}
        </Button>
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

export default SearchMessage
