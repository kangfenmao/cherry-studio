import ModelAvatar from '@renderer/components/Avatar/ModelAvatar'
import VisionIcon from '@renderer/components/Icons/VisionIcon'
import SelectModelPopup from '@renderer/components/Popups/SelectModelPopup'
import { isLocalAi } from '@renderer/config/env'
import { isVisionModel } from '@renderer/config/models'
import { useAssistant } from '@renderer/hooks/useAssistant'
import { Assistant } from '@renderer/types'
import { Button } from 'antd'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

interface Props {
  assistant: Assistant
}

const SelectModelButton: FC<Props> = ({ assistant }) => {
  const { model, setModel } = useAssistant(assistant.id)
  const { t } = useTranslation()

  if (isLocalAi) {
    return null
  }

  const onSelectModel = async (event: React.MouseEvent<HTMLElement>) => {
    event.currentTarget.blur()
    const selectedModel = await SelectModelPopup.show({ model })
    if (selectedModel) {
      setModel(selectedModel)
    }
  }

  return (
    <DropdownButton size="small" type="default" onClick={onSelectModel}>
      <ModelAvatar model={model} size={20} />
      <ModelName>{model ? model.name : t('button.select_model')}</ModelName>
      {isVisionModel(model) && <VisionIcon style={{ marginLeft: 0 }} />}
    </DropdownButton>
  )
}

const DropdownButton = styled(Button)`
  font-size: 11px;
  border-radius: 15px;
  padding: 12px 8px 12px 3px;
  -webkit-app-region: none;
`

const ModelName = styled.span`
  margin-left: -2px;
  font-weight: bolder;
`

export default SelectModelButton
