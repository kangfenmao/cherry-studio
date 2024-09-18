import { FileTypes, Message } from '@renderer/types'
import { getFileDirectory } from '@renderer/utils'
import { Image as AntdImage, Upload } from 'antd'
import { FC } from 'react'
import styled from 'styled-components'

interface Props {
  message: Message
}

const MessageAttachments: FC<Props> = ({ message }) => {
  if (message?.files && message.files[0]?.type === FileTypes.IMAGE) {
    return (
      <Container>
        {message.files?.map((image) => <Image src={'file://' + image.path} key={image.id} width="33%" />)}
      </Container>
    )
  }

  return (
    <Container style={{ marginTop: -5 }}>
      <Upload
        listType="picture"
        disabled
        onPreview={(item) => item.url && window.open(getFileDirectory(item.url))}
        fileList={message.files?.map((file) => ({
          uid: file.id,
          url: 'file://' + file.path,
          status: 'done',
          name: file.origin_name
        }))}
      />
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
