import ModelAvatar from '@renderer/components/Avatar/ModelAvatar'
import VisionIcon from '@renderer/components/Icons/VisionIcon'
import { isLocalAi } from '@renderer/config/env'
import { isVisionModel } from '@renderer/config/models'
import { useAssistant } from '@renderer/hooks/useAssistant'
import { Assistant } from '@renderer/types'
import { Button } from 'antd'
import { upperFirst } from 'lodash'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import SelectModelDropdown from './SelectModelDropdown'

interface Props {
  assistant: Assistant
}

const SelectModelButton: FC<Props> = ({ assistant }) => {
  const { model, setModel } = useAssistant(assistant.id)
  const { t } = useTranslation()

  if (isLocalAi) {
    return null
  }

  return (
    <SelectModelDropdown model={model} onSelect={setModel} placement="top">
      <DropdownButton size="small" type="default">
        <ModelAvatar model={model} size={20} />
        <ModelName>{model ? upperFirst(model.name) : t('button.select_model')}</ModelName>
        {isVisionModel(model) && <VisionIcon style={{ marginLeft: 0 }} />}
      </DropdownButton>
    </SelectModelDropdown>
  )
}

const DropdownButton = styled(Button)`
  font-size: 11px;
  border-radius: 15px;
  padding: 12px 8px 12px 3px;
`

const ModelName = styled.span`
  margin-left: -2px;
  font-weight: bolder;
`

export default SelectModelButton
