import {
  DeleteOutlined,
  EditOutlined,
  FileTextOutlined,
  GlobalOutlined,
  LinkOutlined,
  PlusOutlined,
  SearchOutlined
} from '@ant-design/icons'
import PromptPopup from '@renderer/components/Popups/PromptPopup'
import TextEditPopup from '@renderer/components/Popups/TextEditPopup'
import Scrollbar from '@renderer/components/Scrollbar'
import { useKnowledge } from '@renderer/hooks/useknowledge'
import FileManager from '@renderer/services/FileManager'
import { FileType, FileTypes, KnowledgeBase } from '@renderer/types'
import { Button, Card, message, Typography, Upload } from 'antd'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import KnowledgeSearchPopup from './components/KnowledgeSearchPopup'
import StatusIcon from './components/StatusIcon'

const { Dragger } = Upload
const { Title } = Typography

interface KnowledgeContentProps {
  selectedBase: KnowledgeBase
}

const KnowledgeContent: FC<KnowledgeContentProps> = ({ selectedBase }) => {
  const { t } = useTranslation()
  const {
    base,
    noteItems,
    fileItems,
    urlItems,
    sitemapItems,
    addFiles,
    updateNoteContent,
    addUrl,
    addSitemap,
    removeItem,
    getProcessingStatus,
    addNote
  } = useKnowledge(selectedBase.id || '')

  if (!base) {
    return null
  }

  const handleAddFile = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.multiple = true
    input.accept = '.pdf,.txt,.docx,.md'
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files
      if (files) {
        handleDrop(Array.from(files))
      }
    }
    input.click()
  }

  const handleDrop = async (files: File[]) => {
    if (files) {
      const _files: FileType[] = files.map((file) => ({
        id: file.name,
        name: file.name,
        path: file.path,
        size: file.size,
        ext: `.${file.name.split('.').pop()}`,
        count: 1,
        origin_name: file.name,
        type: file.type as FileTypes,
        created_at: new Date()
      }))
      console.debug('[KnowledgeContent] Uploading files:', _files, files)
      const uploadedFiles = await FileManager.uploadFiles(_files)
      addFiles(uploadedFiles)
    }
  }

  const handleAddUrl = async () => {
    const url = await PromptPopup.show({
      title: t('knowledge_base.add_url'),
      message: '',
      inputPlaceholder: t('knowledge_base.url_placeholder'),
      inputProps: {
        maxLength: 1000,
        rows: 1
      }
    })

    if (url) {
      try {
        new URL(url)
        if (urlItems.find((item) => item.content === url)) {
          message.success(t('knowledge_base.url_added'))
          return
        }
        addUrl(url)
      } catch (e) {
        console.error('Invalid URL:', url)
      }
    }
  }

  const handleAddSitemap = async () => {
    const url = await PromptPopup.show({
      title: t('knowledge_base.add_sitemap'),
      message: '',
      inputPlaceholder: t('knowledge_base.sitemap_placeholder'),
      inputProps: {
        maxLength: 1000,
        rows: 1
      }
    })

    if (url) {
      try {
        new URL(url)
        if (sitemapItems.find((item) => item.content === url)) {
          message.success(t('knowledge_base.sitemap_added'))
          return
        }
        addSitemap(url)
      } catch (e) {
        console.error('Invalid Sitemap URL:', url)
      }
    }
  }

  const handleAddNote = async () => {
    const note = await TextEditPopup.show({ text: '', textareaProps: { rows: 20 } })
    note && addNote(note)
  }

  const handleEditNote = async (note: any) => {
    const editedText = await TextEditPopup.show({ text: note.content as string, textareaProps: { rows: 20 } })
    editedText && updateNoteContent(note.id, editedText)
  }

  return (
    <MainContent>
      <FileSection>
        <TitleWrapper>
          <Title level={5}>{t('files.title')}</Title>
          <Button icon={<PlusOutlined />} onClick={handleAddFile}>
            {t('knowledge_base.add_file')}
          </Button>
        </TitleWrapper>
        <Dragger
          showUploadList={false}
          customRequest={({ file }) => handleDrop([file as File])}
          multiple={true}
          accept=".pdf,.txt,.docx,.md"
          style={{ marginTop: 10, background: 'transparent' }}>
          <p className="ant-upload-text">{t('knowledge_base.drag_file')}</p>
          <p className="ant-upload-hint">{t('knowledge_base.file_hint')}</p>
        </Dragger>
      </FileSection>

      <FileListSection>
        {fileItems.map((item) => {
          const file = item.content as FileType
          return (
            <ItemCard key={item.id}>
              <ItemContent>
                <ItemInfo>
                  <FileTextOutlined style={{ fontSize: '16px' }} />
                  <span>{file.origin_name}</span>
                </ItemInfo>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <StatusIcon sourceId={item.id} base={base} getProcessingStatus={getProcessingStatus} />
                  <Button type="text" danger onClick={() => removeItem(item)} icon={<DeleteOutlined />} />
                </div>
              </ItemContent>
            </ItemCard>
          )
        })}
      </FileListSection>

      <ContentSection>
        <TitleWrapper>
          <Title level={5}>{t('knowledge_base.urls')}</Title>
          <Button icon={<PlusOutlined />} onClick={handleAddUrl}>
            {t('knowledge_base.add_url')}
          </Button>
        </TitleWrapper>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {urlItems.map((item) => (
            <ItemCard key={item.id}>
              <ItemContent>
                <ItemInfo>
                  <LinkOutlined style={{ fontSize: '16px' }} />
                  <a href={item.content as string} target="_blank" rel="noopener noreferrer">
                    {item.content as string}
                  </a>
                </ItemInfo>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <StatusIcon sourceId={item.id} base={base} getProcessingStatus={getProcessingStatus} />
                  <Button type="text" danger onClick={() => removeItem(item)} icon={<DeleteOutlined />} />
                </div>
              </ItemContent>
            </ItemCard>
          ))}
        </div>
      </ContentSection>

      <ContentSection>
        <TitleWrapper>
          <Title level={5}>{t('knowledge_base.sitemaps')}</Title>
          <Button icon={<PlusOutlined />} onClick={handleAddSitemap}>
            {t('knowledge_base.add_sitemap')}
          </Button>
        </TitleWrapper>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {sitemapItems.map((item) => (
            <ItemCard key={item.id}>
              <ItemContent>
                <ItemInfo>
                  <GlobalOutlined style={{ fontSize: '16px' }} />
                  <a href={item.content as string} target="_blank" rel="noopener noreferrer">
                    {item.content as string}
                  </a>
                </ItemInfo>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <StatusIcon sourceId={item.id} base={base} getProcessingStatus={getProcessingStatus} />
                  <Button type="text" danger onClick={() => removeItem(item)} icon={<DeleteOutlined />} />
                </div>
              </ItemContent>
            </ItemCard>
          ))}
        </div>
      </ContentSection>

      <ContentSection>
        <TitleWrapper>
          <Title level={5}>{t('knowledge_base.notes')}</Title>
          <Button icon={<PlusOutlined />} onClick={handleAddNote}>
            {t('knowledge_base.add_note')}
          </Button>
        </TitleWrapper>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {noteItems.map((note) => (
            <ItemCard key={note.id}>
              <ItemContent>
                <ItemInfo onClick={() => handleEditNote(note)} style={{ cursor: 'pointer' }}>
                  <span>{(note.content as string).slice(0, 50)}...</span>
                </ItemInfo>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <Button type="text" onClick={() => handleEditNote(note)} icon={<EditOutlined />} />
                  <StatusIcon sourceId={note.id} base={base} getProcessingStatus={getProcessingStatus} />
                  <Button type="text" danger onClick={() => removeItem(note)} icon={<DeleteOutlined />} />
                </div>
              </ItemContent>
            </ItemCard>
          ))}
        </div>
      </ContentSection>
      <IndexSection>
        <Button type="primary" onClick={() => KnowledgeSearchPopup.show({ base })} icon={<SearchOutlined />}>
          {t('knowledge_base.search')}
        </Button>
      </IndexSection>
      <div style={{ minHeight: '20px' }} />
    </MainContent>
  )
}

const MainContent = styled(Scrollbar)`
  display: flex;
  width: 100%;
  flex-direction: column;
  padding-bottom: 50px;
  padding: 15px;
`

const FileSection = styled.div`
  display: flex;
  flex-direction: column;
`

const ContentSection = styled.div`
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;

  .ant-input-textarea {
    background: var(--color-background-soft);
    border-radius: 8px;
  }
`

const TitleWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
  background-color: var(--color-background-soft);
  padding: 5px 20px;
  min-height: 45px;
  border-radius: 6px;
  .ant-typography {
    margin-bottom: 0;
  }
`

const FileListSection = styled.div`
  margin-top: 20px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const ItemCard = styled(Card)`
  background-color: transparent;
  border: none;
  .ant-card-body {
    padding: 0 20px;
  }
`

const ItemContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
`

const ItemInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;

  a {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 600px;
  }
`

const IndexSection = styled.div`
  margin-top: 20px;
  display: flex;
  justify-content: center;
`

export default KnowledgeContent
