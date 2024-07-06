import { useSettings } from '@renderer/hooks/useSettings'
import { Dropdown, MenuProps } from 'antd'
import { FC, PropsWithChildren } from 'react'

interface Props extends PropsWithChildren {}

const SendMessageSetting: FC<Props> = ({ children }) => {
  const { sendMessageShortcut, setSendMessageShortcut } = useSettings()

  const sendSettingItems: MenuProps['items'] = [
    {
      label: 'Enter Send',
      key: 'Enter',
      onClick: () => setSendMessageShortcut('Enter')
    },
    {
      label: 'Shift + Enter Send',
      key: 'Shift+Enter',
      onClick: () => setSendMessageShortcut('Shift+Enter')
    }
  ]

  return (
    <Dropdown
      menu={{ items: sendSettingItems, selectable: true, defaultSelectedKeys: [sendMessageShortcut] }}
      placement="top"
      trigger={['click']}
      arrow>
      {children}
    </Dropdown>
  )
}

export default SendMessageSetting
