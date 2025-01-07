import { isEmbeddingModel, isVisionModel, isWebSearchModel } from '@renderer/config/models'
import { Model } from '@renderer/types'
import { isFreeModel } from '@renderer/utils'
import { Tag } from 'antd'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'

import VisionIcon from './Icons/VisionIcon'
import WebSearchIcon from './Icons/WebSearchIcon'

interface ModelTagsProps {
  model: Model
}

const ModelTags: FC<ModelTagsProps> = ({ model }) => {
  const { t } = useTranslation()
  return (
    <>
      {isVisionModel(model) && <VisionIcon />}
      {isWebSearchModel(model) && <WebSearchIcon />}
      {isFreeModel(model) && (
        <Tag style={{ marginLeft: 10 }} color="green">
          {t('models.free')}
        </Tag>
      )}
      {isEmbeddingModel(model) && (
        <Tag style={{ marginLeft: 10 }} color="orange">
          {t('models.embedding')}
        </Tag>
      )}
    </>
  )
}

export default ModelTags
