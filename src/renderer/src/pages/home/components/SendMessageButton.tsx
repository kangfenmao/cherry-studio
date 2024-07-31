import { useSettings } from '@renderer/hooks/useSettings'
import { Dropdown, MenuProps } from 'antd'
import { FC } from 'react'
import { ArrowUpOutlined, EnterOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { SendOutlined } from '@ant-design/icons'

interface Props {
  sendMessage: () => void
}

const SendMessageButton: FC<Props> = ({ sendMessage }) => {
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
    <Dropdown.Button
      size="small"
      onClick={sendMessage}
      trigger={['click']}
      placement="topLeft"
      arrow
      menu={{ items: sendSettingItems, selectable: true, defaultSelectedKeys: [sendMessageShortcut] }}
      style={{ width: 'auto' }}>
      {t('assistant.input.send')}
      <SendOutlined />
    </Dropdown.Button>
  )
}

export default SendMessageButton
