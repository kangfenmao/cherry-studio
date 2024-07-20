import { useSettings } from '@renderer/hooks/useSettings'
import { Dropdown, MenuProps } from 'antd'
import { FC, PropsWithChildren } from 'react'
import { ArrowUpOutlined, EnterOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'

interface Props extends PropsWithChildren {}

const SendMessageSetting: FC<Props> = ({ children }) => {
  const { sendMessageShortcut, setSendMessageShortcut } = useSettings()
  const { t } = useTranslation()

  const sendSettingItems: MenuProps['items'] = [
    {
      label: `Enter ${t('assistant.input.send')}`,
      key: 'Enter',
      icon: <EnterOutlined />,
      onClick: () => setSendMessageShortcut('Enter')
    },
    {
      label: `Shift+Enter ${t('assistant.input.send')}`,
      key: 'Shift+Enter',
      icon: <ArrowUpOutlined />,
      onClick: () => setSendMessageShortcut('Shift+Enter')
    }
  ]

  return (
    <Dropdown
      menu={{ items: sendSettingItems, selectable: true, defaultSelectedKeys: [sendMessageShortcut] }}
      placement="topRight"
      trigger={['click']}
      arrow>
      {children}
    </Dropdown>
  )
}

export default SendMessageSetting
