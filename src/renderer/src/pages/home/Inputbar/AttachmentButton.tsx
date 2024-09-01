import { PaperClipOutlined } from '@ant-design/icons'
import { Tooltip, Upload } from 'antd'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'

interface Props {
  images: string[]
  setImages: (images: string[]) => void
  ToolbarButton: any
}

const AttachmentButton: FC<Props> = ({ images, setImages, ToolbarButton }) => {
  const { t } = useTranslation()

  return (
    <Tooltip placement="top" title={t('chat.input.upload')} arrow>
      <Upload
        customRequest={() => {}}
        accept="image/*"
        itemRender={() => null}
        maxCount={1}
        onChange={async ({ file }) => {
          try {
            const _file = file.originFileObj as File
            const reader = new FileReader()
            reader.onload = (e: ProgressEvent<FileReader>) => {
              const result = e.target?.result
              if (typeof result === 'string') {
                setImages([result])
              }
            }
            reader.readAsDataURL(_file)
          } catch (error: any) {
            window.message.error(error.message)
          }
        }}>
        <ToolbarButton type="text" className={images.length ? 'active' : ''}>
          <PaperClipOutlined style={{ rotate: '135deg' }} />
        </ToolbarButton>
      </Upload>
    </Tooltip>
  )
}

export default AttachmentButton
