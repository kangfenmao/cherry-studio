import { BarsOutlined, SettingOutlined } from '@ant-design/icons'
import { useShowTopics } from '@renderer/hooks/useStore'
import { EVENT_NAMES, EventEmitter } from '@renderer/services/event'
import { Assistant, Topic } from '@renderer/types'
import { Segmented } from 'antd'
import { FC, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import Settings from './Settings'
import Topics from './Topics'

interface Props {
  assistant: Assistant
  activeTopic: Topic
  setActiveTopic: (topic: Topic) => void
}

const RightSidebar: FC<Props> = (props) => {
  const [tab, setTab] = useState<'topic' | 'settings'>('topic')
  const { showTopics, setShowTopics } = useShowTopics()
  const { t } = useTranslation()
  const isTopicTab = tab === 'topic'
  const isSettingsTab = tab === 'settings'

  useEffect(() => {
    const unsubscribes = [
      EventEmitter.on(EVENT_NAMES.SHOW_TOPIC_SIDEBAR, (): any => {
        if (showTopics && isTopicTab) {
          return setShowTopics(false)
        }
        if (showTopics) {
          return setTab('topic')
        }
        setShowTopics(true)
        setTab('topic')
      }),
      EventEmitter.on(EVENT_NAMES.SHOW_CHAT_SETTINGS, (): any => {
        if (showTopics && isSettingsTab) {
          return setShowTopics(false)
        }
        if (showTopics) {
          return setTab('settings')
        }
        setShowTopics(true)
        setTab('settings')
      }),
      EventEmitter.on(EVENT_NAMES.SWITCH_TOPIC_SIDEBAR, () => setTab('topic'))
    ]
    return () => unsubscribes.forEach((unsub) => unsub())
  }, [isSettingsTab, isTopicTab, showTopics, setShowTopics])

  if (!showTopics) {
    return null
  }

  return (
    <Container>
      <Segmented
        value={tab}
        style={{ borderRadius: 0, padding: '10px', gap: 5, borderBottom: '0.5px solid var(--color-border)' }}
        options={[
          { label: t('common.topics'), value: 'topic', icon: <BarsOutlined /> },
          { label: t('settings.title'), value: 'settings', icon: <SettingOutlined /> }
        ]}
        block
        onChange={(value) => setTab(value as 'topic' | 'settings')}
      />
      <TabContent>
        {tab === 'topic' && <Topics {...props} />}
        {tab === 'settings' && <Settings assistant={props.assistant} />}
      </TabContent>
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: var(--topic-list-width);
  height: calc(100vh - var(--navbar-height));
  border-left: 0.5px solid var(--color-border);
  .collapsed {
    width: 0;
    border-left: none;
  }
`

const TabContent = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow-y: auto;
`

export default RightSidebar
