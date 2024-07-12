import { FC } from 'react'
import { SettingContainer, SettingDivider, SettingRow, SettingRowTitle, SettingTitle } from './components'
import { Avatar, message, Upload } from 'antd'
import styled from 'styled-components'
import LocalStorage from '@renderer/services/storage'
import { compressImage } from '@renderer/utils'
import useAvatar from '@renderer/hooks/useAvatar'
import { useAppDispatch } from '@renderer/store'
import { setAvatar } from '@renderer/store/runtime'

const GeneralSettings: FC = () => {
  const avatar = useAvatar()
  const [messageApi, contextHolder] = message.useMessage()
  const dispatch = useAppDispatch()

  return (
    <SettingContainer>
      {contextHolder}
      <SettingTitle>General Settings</SettingTitle>
      <SettingDivider />
      <SettingRow>
        <SettingRowTitle>Avatar</SettingRowTitle>
        <Upload
          customRequest={() => {}}
          accept="image/png, image/jpeg"
          itemRender={() => null}
          maxCount={1}
          onChange={async ({ file }) => {
            try {
              const _file = file.originFileObj as File
              const compressedFile = await compressImage(_file)
              await LocalStorage.storeImage('avatar', compressedFile)
              dispatch(setAvatar(await LocalStorage.getImage('avatar')))
            } catch (error: any) {
              messageApi.open({
                type: 'error',
                content: error.message
              })
            }
          }}>
          <UserAvatar src={avatar} size="large" />
        </Upload>
      </SettingRow>
      <SettingDivider />
    </SettingContainer>
  )
}

const UserAvatar = styled(Avatar)`
  cursor: pointer;
`

export default GeneralSettings
