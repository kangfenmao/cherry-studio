import { Message } from '@renderer/types'
import { Image as AntdImage } from 'antd'
import { FC } from 'react'
import styled from 'styled-components'

interface Props {
  message: Message
}

const MessageAttachments: FC<Props> = ({ message }) => {
  return <Container>{message.images?.map((image) => <Image src={image} key={image} width="33%" />)}</Container>
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
