import { GlobalOutlined } from '@ant-design/icons'
import React, { FC } from 'react'
import styled from 'styled-components'

const WebSearchIcon: FC<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>> = (props) => {
  return <Icon {...(props as any)} />
}

const Icon = styled(GlobalOutlined)`
  color: var(--color-link);
  font-size: 12px;
  margin-left: 4px;
`

export default WebSearchIcon
