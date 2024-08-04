import { CodeSandboxOutlined } from '@ant-design/icons'
import { NavbarCenter } from '@renderer/components/app/Navbar'
import { isMac } from '@renderer/config/constant'
import { useAssistant } from '@renderer/hooks/useAssistant'
import { useShowAssistants } from '@renderer/hooks/useStore'
import { Assistant } from '@renderer/types'
import { removeLeadingEmoji } from '@renderer/utils'
import { Button } from 'antd'
import { upperFirst } from 'lodash'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { NewButton } from '../HomePage'
import SelectModelDropdown from './SelectModelDropdown'

interface Props {
  activeAssistant: Assistant
}

const NavigationCenter: FC<Props> = ({ activeAssistant }) => {
  const { assistant } = useAssistant(activeAssistant.id)
  const { model, setModel } = useAssistant(activeAssistant.id)
  const { t } = useTranslation()
  const { showAssistants, toggleShowAssistants } = useShowAssistants()

  return (
    <NavbarCenter style={{ paddingLeft: isMac ? 16 : 8 }}>
      {!showAssistants && (
        <NewButton onClick={toggleShowAssistants} style={{ marginRight: isMac ? 8 : 25 }}>
          <i className="iconfont icon-showsidebarhoriz" />
        </NewButton>
      )}
      <AssistantName>{removeLeadingEmoji(assistant?.name) || t('assistant.default.name')}</AssistantName>
      <SelectModelDropdown model={model} onSelect={setModel}>
        <DropdownButton size="small" type="primary" ghost>
          <CodeSandboxOutlined />
          <ModelName>{model ? upperFirst(model.name) : t('button.select_model')}</ModelName>
        </DropdownButton>
      </SelectModelDropdown>
    </NavbarCenter>
  )
}

const AssistantName = styled.span`
  font-weight: bold;
  margin-left: 5px;
  margin-right: 10px;
`

const DropdownButton = styled(Button)`
  font-size: 11px;
  border-radius: 15px;
  padding: 0 8px;
`

const ModelName = styled.span`
  margin-left: -2px;
  font-weight: bolder;
`

export default NavigationCenter
