import { Navbar, NavbarCenter } from '@renderer/components/app/Navbar'
import { VStack } from '@renderer/components/Layout'
import { FileMetadata } from '@renderer/types'
import { Image, Table } from 'antd'
import { FC, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

const FilesPage: FC = () => {
  const { t } = useTranslation()
  const [files, setFiles] = useState<FileMetadata[]>([])

  useEffect(() => {
    window.api.file.all().then(setFiles)
  }, [])

  const dataSource = files.map((file) => ({
    file: <Image src={'file://' + file.path} preview={false} style={{ maxHeight: '40px' }} />,
    name: <a href={'file://' + file.path}>{file.name}</a>,
    size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
    created_at: file.created_at.toISOString().split('T')[0]
  }))

  const columns = [
    {
      title: 'File',
      dataIndex: 'file',
      key: 'file'
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Size',
      dataIndex: 'size',
      key: 'size',
      width: '100px'
    },
    {
      title: 'Created At',
      dataIndex: 'created_at',
      key: 'created_at',
      width: '120px'
    }
  ]

  // const handleSelectFile = async () => {
  //   const files = await window.api.fileSelect({
  //     properties: ['openFile', 'multiSelections']
  //   })
  //   for (const file of files || []) {
  //     const result = await window.api.fileUpload(file.path)
  //     console.log('Selected file:', file, result)
  //   }
  // }

  return (
    <Container>
      <Navbar>
        <NavbarCenter style={{ borderRight: 'none' }}>{t('files.title')}</NavbarCenter>
      </Navbar>
      <ContentContainer>
        <VStack style={{ flex: 1 }}>
          <Table dataSource={dataSource} columns={columns} style={{ width: '100%', height: '100%' }} />
        </VStack>
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
