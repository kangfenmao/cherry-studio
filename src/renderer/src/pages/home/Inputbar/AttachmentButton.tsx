import { PaperClipOutlined } from '@ant-design/icons'
import { FileMetadata } from '@renderer/types'
import { Tooltip } from 'antd'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'

interface Props {
  files: FileMetadata[]
  setFiles: (files: FileMetadata[]) => void
  ToolbarButton: any
}

const AttachmentButton: FC<Props> = ({ files, setFiles, ToolbarButton }) => {
  const { t } = useTranslation()

  const onSelectFile = async () => {
    const _files = await window.api.file.select({
      filters: [{ name: 'Files', extensions: ['jpg', 'png', 'jpeg'] }]
    })
    _files && setFiles(_files)
  }

  return (
    <Tooltip placement="top" title={t('chat.input.upload')} arrow>
      <ToolbarButton type="text" className={files.length ? 'active' : ''} onClick={onSelectFile}>
        <PaperClipOutlined style={{ rotate: '135deg' }} />
      </ToolbarButton>
    </Tooltip>
  )
}

export default AttachmentButton
