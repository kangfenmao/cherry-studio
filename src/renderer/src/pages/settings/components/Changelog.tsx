import changelogEn from '@renderer/assets/changelog/CHANGELOG.en.md?raw'
import changelogZh from '@renderer/assets/changelog/CHANGELOG.zh.md?raw'
import { FC } from 'react'
import Markdown from 'react-markdown'
import styled from 'styled-components'
import styles from '@renderer/assets/styles/changelog.module.scss'
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
  font-size: 14px;
  background-color: var(--color-background-soft);
  margin-top: 40px;
  padding: 20px;
  border-radius: 5px;
  width: 650px;
`

export default Changelog
