import FileManager from '@renderer/services/file'
import { FileType } from '@renderer/types'
import { Upload } from 'antd'
import { isEmpty } from 'lodash'
import { FC } from 'react'
import styled from 'styled-components'

interface Props {
  files: FileType[]
  setFiles: (files: FileType[]) => void
}

const AttachmentPreview: FC<Props> = ({ files, setFiles }) => {
  if (isEmpty(files)) {
    return null
  }

  return (
    <Container>
      <Upload
        listType="picture-card"
        fileList={files.map((file) => ({
          uid: file.id,
          url: 'file://' + FileManager.getSafePath(file),
          status: 'done',
          name: file.name
        }))}
        onRemove={(item) => setFiles(files.filter((file) => item.uid !== file.id))}
      />
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: row;
  gap: 10px;
  margin: 10px 20px;
  margin-right: 0;
`

export default AttachmentPreview
