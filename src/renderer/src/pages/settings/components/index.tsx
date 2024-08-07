import { Divider } from 'antd'
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
  color: var(--color-text-2);
  margin: 15px 0 0 0;
  user-select: none;
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
