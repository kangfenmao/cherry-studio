import { PaperClipOutlined } from '@ant-design/icons'
import { isVisionModel } from '@renderer/config/models'
import { FileType, Model } from '@renderer/types'
import { documentExts, imageExts, textExts } from '@shared/config/constant'
import { Tooltip } from 'antd'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'

interface Props {
  model: Model
  files: FileType[]
  setFiles: (files: FileType[]) => void
  ToolbarButton: any
}

const AttachmentButton: FC<Props> = ({ model, files, setFiles, ToolbarButton }) => {
  const { t } = useTranslation()
  const extensions = isVisionModel(model)
    ? [...imageExts, ...documentExts, ...textExts]
    : [...documentExts, ...textExts]

  const onSelectFile = async () => {
    if (files.length > 0) {
      return setFiles([])
    }

    const _files = await window.api.file.select({
      properties: ['openFile', 'multiSelections'],
      filters: [
        {
          name: 'Files',
          extensions: extensions.map((i) => i.replace('.', ''))
        }
      ]
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
