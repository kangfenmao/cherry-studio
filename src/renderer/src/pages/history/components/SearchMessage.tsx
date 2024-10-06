import { ArrowRightOutlined } from '@ant-design/icons'
import { HStack } from '@renderer/components/Layout'
import { default as MessageItem } from '@renderer/pages/home/Messages/Message'
import { locateToMessage } from '@renderer/services/messages'
import { Message } from '@renderer/types'
import { Button } from 'antd'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import styled from 'styled-components'

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  message?: Message
}

const SearchMessage: FC<Props> = ({ message, ...props }) => {
  const navigate = useNavigate()
  const { t } = useTranslation()

  if (!message) {
    return null
  }

  return (
    <MessagesContainer {...props}>
      <ContainerWrapper style={{ paddingTop: 20, paddingBottom: 20, position: 'relative' }}>
        <MessageItem message={message} showMenu={false} />
        <Button
          type="text"
          size="middle"
          style={{ color: 'var(--color-text-3)', position: 'absolute', right: 0, top: 10 }}
          onClick={() => locateToMessage(navigate, message)}
          icon={<ArrowRightOutlined />}
        />
        <HStack mt="10px" justifyContent="center">
          <Button onClick={() => locateToMessage(navigate, message)} icon={<ArrowRightOutlined />}>
            {t('history.locate.message')}
          </Button>
        </HStack>
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
  .message {
    padding: 0;
  }
`

export default SearchMessage
