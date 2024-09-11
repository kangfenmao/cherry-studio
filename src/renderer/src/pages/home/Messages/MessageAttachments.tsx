import { Message } from '@renderer/types'
import { Image as AntdImage } from 'antd'
import { FC } from 'react'
import styled from 'styled-components'

interface Props {
  message: Message
}

const MessageAttachments: FC<Props> = ({ message }) => {
  return (
    <Container>
      {message.files?.map((image) => <Image src={'file://' + image.path} key={image.id} width="33%" />)}
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: row;
  gap: 10px;
  margin-top: 8px;
`

const Image = styled(AntdImage)`
  border-radius: 10px;
`

export default MessageAttachments
