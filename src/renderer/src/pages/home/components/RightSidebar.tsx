import { Assistant, Topic } from '@renderer/types'
import { FC, useEffect, useState } from 'react'
import styled from 'styled-components'
import TopicsTab from './TopicsTab'
import SettingsTab from './SettingsTab'
import { useTranslation } from 'react-i18next'
import { EVENT_NAMES, EventEmitter } from '@renderer/services/event'
import { useShowRightSidebar } from '@renderer/hooks/useStore'

interface Props {
  assistant: Assistant
  activeTopic: Topic
  setActiveTopic: (topic: Topic) => void
}

const RightSidebar: FC<Props> = (props) => {
  const [tab, setTab] = useState<'topic' | 'settings'>('topic')
  const { rightSidebarShown, showRightSidebar, hideRightSidebar } = useShowRightSidebar()
  const { t } = useTranslation()
  const isTopicTab = tab === 'topic'
  const isSettingsTab = tab === 'settings'

  useEffect(() => {
    const unsubscribes = [
      EventEmitter.on(EVENT_NAMES.SHOW_TOPIC_SIDEBAR, (): any => {
        if (rightSidebarShown && isTopicTab) {
          return hideRightSidebar()
        }
        if (rightSidebarShown) {
          return setTab('topic')
        }
        showRightSidebar()
        setTab('topic')
      }),
      EventEmitter.on(EVENT_NAMES.SHOW_CHAT_SETTINGS, (): any => {
        if (rightSidebarShown && isSettingsTab) {
          return hideRightSidebar()
        }
        if (rightSidebarShown) {
          return setTab('settings')
        }
        showRightSidebar()
        setTab('settings')
      }),
      EventEmitter.on(EVENT_NAMES.SWITCH_TOPIC_SIDEBAR, () => setTab('topic'))
    ]
    return () => unsubscribes.forEach((unsub) => unsub())
  }, [hideRightSidebar, isSettingsTab, isTopicTab, rightSidebarShown, showRightSidebar])

  return (
    <Container style={{ display: rightSidebarShown ? 'block' : 'none' }}>
      <Tabs>
        <Tab className={tab === 'topic' ? 'active' : ''} onClick={() => setTab('topic')}>
          {t('common.topics')}
        </Tab>
        <Tab className={tab === 'settings' ? 'active' : ''} onClick={() => setTab('settings')}>
          {t('settings.title')}
        </Tab>
      </Tabs>
      {tab === 'topic' && <TopicsTab {...props} />}
      {tab === 'settings' && <SettingsTab assistant={props.assistant} />}
    </Container>
  )
}

const Container = styled.div`
  width: var(--topic-list-width);
  height: 100%;
  border-left: 0.5px solid var(--color-border);
  overflow-y: auto;
  .collapsed {
    width: 0;
    border-left: none;
  }
`

const Tabs = styled.div`
  display: flex;
  flex-direction: row;
  border-bottom: 0.5px solid var(--color-border);
  padding: 0 10px;
`

const Tab = styled.div`
  padding: 8px 0;
  font-weight: 500;
  display: flex;
  flex: 1;
  justify-content: center;
  align-items: center;
  font-size: 13px;
  cursor: pointer;
  color: #8a8a8a;
  border-bottom: 1px solid transparent;
  &.active {
    color: #a8a8a8;
    font-weight: 600;
  }
`

export default RightSidebar
