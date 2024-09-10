import { BarsOutlined, SettingOutlined } from '@ant-design/icons'
import { useAssistants, useDefaultAssistant } from '@renderer/hooks/useAssistant'
import { useSettings } from '@renderer/hooks/useSettings'
import { useShowTopics } from '@renderer/hooks/useStore'
import { EVENT_NAMES, EventEmitter } from '@renderer/services/event'
import { Assistant, Topic } from '@renderer/types'
import { uuid } from '@renderer/utils'
import { Segmented, SegmentedProps } from 'antd'
import { FC, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import Assistants from './Assistants'
import Settings from './Settings'
import Topics from './Topics'

interface Props {
  activeAssistant: Assistant
  activeTopic: Topic
  setActiveAssistant: (assistant: Assistant) => void
  setActiveTopic: (topic: Topic) => void
  position: 'left' | 'right'
}

type Tab = 'assistants' | 'topic' | 'settings'

let _tab = ''

const RightSidebar: FC<Props> = ({ activeAssistant, activeTopic, setActiveAssistant, setActiveTopic, position }) => {
  const { addAssistant } = useAssistants()
  const [tab, setTab] = useState<Tab>(_tab || position === 'left' ? 'assistants' : 'topic')
  const { topicPosition } = useSettings()
  const { defaultAssistant } = useDefaultAssistant()
  const { toggleShowTopics } = useShowTopics()

  const { t } = useTranslation()

  const borderStyle = '0.5px solid var(--color-border)'
  const border = position === 'left' ? { borderRight: borderStyle } : { borderLeft: borderStyle }
  _tab = tab

  const showTab = !(position === 'left' && topicPosition === 'right')
  const assistantTab = {
    label: t('common.assistant'),
    value: 'assistants',
    icon: <i className="iconfont icon-business-smart-assistant" />
  }

  const onCreateDefaultAssistant = () => {
    const assistant = { ...defaultAssistant, id: uuid() }
    addAssistant(assistant)
    setActiveAssistant(assistant)
  }

  useEffect(() => {
    const unsubscribes = [
      EventEmitter.on(EVENT_NAMES.SHOW_ASSISTANTS, (): any => {
        showTab && setTab('assistants')
      }),
      EventEmitter.on(EVENT_NAMES.SHOW_TOPIC_SIDEBAR, (): any => {
        showTab && setTab('topic')
      }),
      EventEmitter.on(EVENT_NAMES.SHOW_CHAT_SETTINGS, (): any => {
        showTab && setTab('settings')
      }),
      EventEmitter.on(EVENT_NAMES.SWITCH_TOPIC_SIDEBAR, () => {
        showTab && setTab('topic')
        if (position === 'left' && topicPosition === 'right') {
          toggleShowTopics()
        }
      })
    ]
    return () => unsubscribes.forEach((unsub) => unsub())
  }, [position, showTab, tab, toggleShowTopics, topicPosition])

  return (
    <Container style={{ ...border }}>
      {showTab && (
        <Segmented
          value={tab}
          className="segmented-tab"
          style={{ borderRadius: 0, padding: '10px', gap: 2, borderBottom: borderStyle }}
          options={
            [
              position === 'left' && topicPosition === 'left' ? assistantTab : undefined,
              { label: t('common.topics'), value: 'topic', icon: <BarsOutlined /> },
              { label: t('settings.title'), value: 'settings', icon: <SettingOutlined /> }
            ].filter(Boolean) as SegmentedProps['options']
          }
          onChange={(value) => setTab(value as 'topic' | 'settings')}
          block
        />
      )}
      <TabContent>
        {tab === 'assistants' && (
          <Assistants
            activeAssistant={activeAssistant}
            setActiveAssistant={setActiveAssistant}
            onCreateAssistant={onCreateDefaultAssistant}
          />
        )}
        {tab === 'topic' && (
          <Topics assistant={activeAssistant} activeTopic={activeTopic} setActiveTopic={setActiveTopic} />
        )}
        {tab === 'settings' && <Settings assistant={activeAssistant} />}
      </TabContent>
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: var(--assistants-width);
  height: calc(100vh - var(--navbar-height));
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
  overflow-x: hidden;
`

export default RightSidebar
