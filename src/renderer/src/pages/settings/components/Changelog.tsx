import changelogEn from '@renderer/CHANGELOG.en.md?raw'
import changelogZh from '@renderer/CHANGELOG.zh.md?raw'
import { FC } from 'react'
import Markdown from 'react-markdown'
import styled from 'styled-components'
import styles from './changelog.module.scss'
import i18n from '@renderer/i18n'

const Changelog: FC = () => {
  const language = i18n.language
  const changelog = language === 'zh-CN' ? changelogZh : changelogEn

  return (
    <Container>
      <Markdown className={styles.markdown}>{changelog}</Markdown>
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex: 1;
  font-size: 14px;
  padding: 20px;
  width: 100%;
  overflow-y: scroll;
  border-left: 0.5px solid var(--color-border);
`

export default Changelog
