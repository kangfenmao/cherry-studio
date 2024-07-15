import { FC } from 'react'
import { SettingContainer, SettingDivider, SettingRow, SettingRowTitle, SettingTitle } from './components'
import { Avatar, Select, Upload } from 'antd'
import styled from 'styled-components'
import LocalStorage from '@renderer/services/storage'
import { compressImage } from '@renderer/utils'
import useAvatar from '@renderer/hooks/useAvatar'
import { useAppDispatch } from '@renderer/store'
import { setAvatar } from '@renderer/store/runtime'
import { useSettings } from '@renderer/hooks/useSettings'
import { setLanguage } from '@renderer/store/settings'
import { useTranslation } from 'react-i18next'
import i18next from 'i18next'

const GeneralSettings: FC = () => {
  const avatar = useAvatar()
  const { language } = useSettings()
  const dispatch = useAppDispatch()
  const { t } = useTranslation()

  const onSelectLanguage = (value: string) => {
    dispatch(setLanguage(value))
    i18next.changeLanguage(value)
    localStorage.setItem('language', value)
  }

  return (
    <SettingContainer>
      <SettingTitle>{t('settings.general.title')}</SettingTitle>
      <SettingDivider />
      <SettingRow>
        <SettingRowTitle>{t('common.language')}</SettingRowTitle>
        <Select
          defaultValue={language || 'en-US'}
          style={{ width: 120 }}
          onChange={onSelectLanguage}
          options={[
            { value: 'zh-CN', label: '中文' },
            { value: 'en-US', label: 'English' }
          ]}
        />
      </SettingRow>
      <SettingDivider />
      <SettingRow>
        <SettingRowTitle>{t('common.avatar')}</SettingRowTitle>
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
              window.message.error(error.message)
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
