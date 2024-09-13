import { EyeOutlined } from '@ant-design/icons'
import React, { FC } from 'react'
import styled from 'styled-components'

const VisionIcon: FC<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>> = (props) => {
  return <Icon {...(props as any)} />
}

const Icon = styled(EyeOutlined)`
  color: var(--color-primary);
  font-size: 14px;
  margin-left: 4px;
`

export default VisionIcon
