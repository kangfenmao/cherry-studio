import { FileImageOutlined, FilePdfOutlined, FileTextOutlined } from '@ant-design/icons'
import { Navbar, NavbarCenter } from '@renderer/components/app/Navbar'
import Scrollbar from '@renderer/components/Scrollbar'
import db from '@renderer/databases'
import FileManager from '@renderer/services/FileManager'
import { FileType, FileTypes } from '@renderer/types'
import { formatFileSize } from '@renderer/utils'
import { Col, Image, Menu, Row, Spin, Table } from 'antd'
import dayjs from 'dayjs'
import { useLiveQuery } from 'dexie-react-hooks'
import { FC, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

const FilesPage: FC = () => {
  const { t } = useTranslation()
  const [fileType, setFileType] = useState<FileTypes | 'all'>('all')

  const files = useLiveQuery<FileType[]>(() => {
    if (fileType === 'all') {
      return db.files.orderBy('count').toArray()
    }
    return db.files.where('type').equals(fileType).sortBy('count')
  }, [fileType])

  const dataSource = files?.map((file) => {
    return {
      key: file.id,
      file: <FileNameText className="text-nowrap">{file.origin_name}</FileNameText>,
      size: formatFileSize(file),
      count: file.count,
      created_at: dayjs(file.created_at).format('MM-DD HH:mm'),
      actions: <a href={'file://' + FileManager.getSafePath(file)}>{t('files.open')}</a>
    }
  })

  const columns = [
    {
      title: t('files.name'),
      dataIndex: 'file',
      key: 'file'
    },
    {
      title: t('files.size'),
      dataIndex: 'size',
      key: 'size',
      width: '100px'
    },
    {
      title: t('files.count'),
      dataIndex: 'count',
      key: 'count',
      width: '100px'
    },
    {
      title: t('files.created_at'),
      dataIndex: 'created_at',
      key: 'created_at',
      width: '120px'
    },
    {
      title: t('files.actions'),
      dataIndex: 'actions',
      key: 'actions',
      width: '50px'
    }
  ]

  const menuItems = [
    { key: 'all', label: t('files.all'), icon: <FileTextOutlined /> },
    { key: FileTypes.IMAGE, label: t('files.image'), icon: <FileImageOutlined /> },
    { key: FileTypes.TEXT, label: t('files.text'), icon: <FileTextOutlined /> },
    { key: FileTypes.DOCUMENT, label: t('files.document'), icon: <FilePdfOutlined /> }
  ]

  return (
    <Container>
      <Navbar>
        <NavbarCenter style={{ borderRight: 'none' }}>{t('files.title')}</NavbarCenter>
      </Navbar>
      <ContentContainer id="content-container">
        <SideNav>
          <Menu selectedKeys={[fileType]} items={menuItems} onSelect={({ key }) => setFileType(key as FileTypes)} />
        </SideNav>
        <TableContainer right>
          {fileType === FileTypes.IMAGE && files?.length > 0 ? (
            <Image.PreviewGroup>
              <Row gutter={[16, 16]}>
                {files?.map((file) => (
                  <Col key={file.id} xs={24} sm={12} md={8} lg={4} xl={3}>
                    <ImageWrapper>
                      <LoadingWrapper>
                        <Spin />
                      </LoadingWrapper>
                      <Image
                        src={FileManager.getFileUrl(file)}
                        style={{ height: '100%', objectFit: 'cover', cursor: 'pointer' }}
                        preview={{ mask: false }}
                        onLoad={(e) => {
                          const img = e.target as HTMLImageElement
                          img.parentElement?.classList.add('loaded')
                        }}
                      />
                      <ImageInfo>
                        <div>{formatFileSize(file)}</div>
                      </ImageInfo>
                    </ImageWrapper>
                  </Col>
                ))}
              </Row>
            </Image.PreviewGroup>
          ) : (
            <Table
              dataSource={dataSource}
              columns={columns}
              style={{ width: '100%' }}
              size="small"
              pagination={{ pageSize: 100 }}
            />
          )}
        </TableContainer>
      </ContentContainer>
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  height: calc(100vh - var(--navbar-height));
`

const ContentContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: row;
  min-height: 100%;
`

const TableContainer = styled(Scrollbar)`
  padding: 15px;
  display: flex;
  width: 100%;
  flex-direction: column;
`

const FileNameText = styled.div`
  font-size: 14px;
  color: var(--color-text);
`

const ImageWrapper = styled.div`
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
  border-radius: 8px;
  background-color: var(--color-background-soft);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 0.5px solid var(--color-border);

  .ant-image {
    height: 100%;
    width: 100%;
    opacity: 0;
    transition:
      opacity 0.3s ease,
      transform 0.3s ease;

    &.loaded {
      opacity: 1;
    }
  }

  &:hover {
    .ant-image.loaded {
      transform: scale(1.05);
    }

    div:last-child {
      opacity: 1;
    }
  }
`

const LoadingWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-background-soft);
`

const ImageInfo = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 5px 8px;
  opacity: 0;
  transition: opacity 0.3s ease;
  font-size: 12px;

  > div:first-child {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`

const SideNav = styled.div`
  width: var(--assistants-width);
  border-right: 0.5px solid var(--color-border);
  padding: 15px;

  .ant-menu {
    border-inline-end: none !important;
    background: transparent;
  }

  .ant-menu-item {
    height: 40px;
    line-height: 40px;
    margin: 4px 0;
    width: 100%;

    &:hover {
      background-color: var(--color-background-soft);
    }

    &.ant-menu-item-selected {
      background-color: var(--color-background-soft);
      color: var(--color-primary);
    }
  }
`

export default FilesPage
