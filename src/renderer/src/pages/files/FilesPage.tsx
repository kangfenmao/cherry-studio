import { Navbar, NavbarCenter } from '@renderer/components/app/Navbar'
import { Button } from 'antd'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

const FilesPage: FC = () => {
  const { t } = useTranslation()

  const handleSelectFile = async () => {
    const files = await window.api.fileSelect({
      properties: ['openFile', 'multiSelections']
    })
    for (const file of files || []) {
      const result = await window.api.fileUpload(file.path)
      console.log('Selected file:', file, result)
    }
  }

  return (
    <Container>
      <Navbar>
        <NavbarCenter style={{ borderRight: 'none' }}>{t('files.title')}</NavbarCenter>
      </Navbar>
      <ContentContainer>
        <Button onClick={handleSelectFile}>添加文件</Button>
      </ContentContainer>
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  height: 100%;
`

const ContentContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: row;
  justify-content: center;
  height: 100%;
  overflow-y: scroll;
  background-color: var(--color-background);
  padding: 20px;
`

export default FilesPage
