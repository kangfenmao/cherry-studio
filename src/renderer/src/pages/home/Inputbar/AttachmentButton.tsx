import { PaperClipOutlined } from '@ant-design/icons'
import { Tooltip, Upload } from 'antd'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'

interface Props {
  files: File[]
  setFiles: (files: File[]) => void
  ToolbarButton: any
}

const AttachmentButton: FC<Props> = ({ files, setFiles, ToolbarButton }) => {
  const { t } = useTranslation()

  return (
    <Tooltip placement="top" title={t('chat.input.upload')} arrow>
      <Upload
        customRequest={() => {}}
        accept="image/*"
        itemRender={() => null}
        maxCount={1}
        onChange={async ({ file }) => file?.originFileObj && setFiles([file.originFileObj as File])}>
        <ToolbarButton type="text" className={files.length ? 'active' : ''}>
          <PaperClipOutlined style={{ rotate: '135deg' }} />
        </ToolbarButton>
      </Upload>
    </Tooltip>
  )
}

export default AttachmentButton
