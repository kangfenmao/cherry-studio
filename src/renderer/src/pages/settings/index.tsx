import { Divider } from 'antd'
import Link from 'antd/es/typography/Link'
import styled from 'styled-components'

export const SettingContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  height: calc(100vh - var(--navbar-height));
  padding: 15px;
  overflow-y: scroll;
  font-family: Ubuntu;

  &::-webkit-scrollbar {
    display: none;
  }
`

export const SettingTitle = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  font-weight: 900;
  user-select: none;
`

export const SettingSubtitle = styled.div`
  font-size: 14px;
  color: var(--color-text-1);
  margin: 15px 0 0 0;
  user-select: none;
  font-weight: bold;
`

export const SettingDivider = styled(Divider)`
  margin: 10px 0;
`

export const SettingRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`

export const SettingRowTitle = styled.div`
  font-size: 14px;
  line-height: 18px;
  color: var(--color-text-1);
`

export const SettingHelpTextRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 5px 0;
`

export const SettingHelpText = styled.div`
  font-size: 11px;
  color: var(--color-text);
  opacity: 0.4;
`

export const SettingHelpLink = styled(Link)`
  font-size: 11px;
  padding: 0 5px;
`
