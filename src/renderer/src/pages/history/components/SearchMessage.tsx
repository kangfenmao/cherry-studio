import { default as MessageItem } from '@renderer/pages/home/Messages/Message'
import { Message } from '@renderer/types'
import { FC } from 'react'
import styled from 'styled-components'

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  message?: Message
}

const SearchMessage: FC<Props> = ({ message, ...props }) => {
  if (!message) {
    return null
  }

  return (
    <MessagesContainer {...props}>
      <ContainerWrapper style={{ paddingTop: 30, paddingBottom: 30 }}>
        <MessageItem message={message} showMenu={false} />
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
