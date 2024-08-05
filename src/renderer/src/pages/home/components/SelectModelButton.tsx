import { getModelLogo } from '@renderer/config/provider'
import { useAssistant } from '@renderer/hooks/useAssistant'
import { Assistant } from '@renderer/types'
import { Avatar, Button } from 'antd'
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

  return (
    <SelectModelDropdown model={model} onSelect={setModel}>
      <DropdownButton size="small" type="default">
        <Avatar src={getModelLogo(model?.id || '')} style={{ width: 20, height: 20 }} />
        <ModelName>{model ? upperFirst(model.name) : t('button.select_model')}</ModelName>
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
