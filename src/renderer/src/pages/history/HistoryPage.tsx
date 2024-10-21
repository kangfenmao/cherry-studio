import { ArrowLeftOutlined, EnterOutlined, SearchOutlined } from '@ant-design/icons'
import { Navbar, NavbarCenter } from '@renderer/components/app/Navbar'
import { Message, Topic } from '@renderer/types'
import { Divider, Input } from 'antd'
import { last } from 'lodash'
import { FC, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import SearchMessage from './components/SearchMessage'
import SearchResults from './components/SearchResults'
import TopicMessages from './components/TopicMessages'
import TopicsHistory from './components/TopicsHistory'

type Route = 'topics' | 'topic' | 'search' | 'message'

let _search = ''
let _stack: Route[] = ['topics']
let _topic: Topic | undefined
let _message: Message | undefined

const TopicsPage: FC = () => {
  const { t } = useTranslation()
  const [search, setSearch] = useState(_search)
  const [stack, setStack] = useState<Route[]>(_stack)
  const [topic, setTopic] = useState<Topic | undefined>(_topic)
  const [message, setMessage] = useState<Message | undefined>(_message)

  _search = search
  _stack = stack
  _topic = topic
  _message = message

  const goBack = () => {
    const _stack = [...stack]
    const route = _stack.pop()
    setStack(_stack)
    route === 'search' && setSearch('')
    route === 'topic' && setTopic(undefined)
    route === 'message' && setMessage(undefined)
  }

  const onSearch = () => {
    setStack(['topics', 'search'])
    setTopic(undefined)
  }

  const onTopicClick = (topic: Topic) => {
    setStack((prev) => [...prev, 'topic'])
    setTopic(topic)
  }

  const onMessageClick = (message: Message) => {
    setStack(['topics', 'search', 'message'])
    setMessage(message)
  }

  const isShow = (route: Route) => (last(stack) === route ? 'flex' : 'none')

  return (
    <Container>
      <Navbar>
        <NavbarCenter style={{ borderRight: 'none', justifyContent: 'flex-start' }}>{t('history.title')} </NavbarCenter>
      </Navbar>
      <ContentContainer id="content-container">
        <Header>
          {stack.length > 1 && (
            <HeaderLeft>
              <MenuIcon onClick={goBack}>
                <ArrowLeftOutlined />
              </MenuIcon>
            </HeaderLeft>
          )}
          <SearchInput
            placeholder={t('history.search.placeholder')}
            type="search"
            value={search}
            allowClear
            onChange={(e) => setSearch(e.target.value.trimStart())}
            suffix={search.length >= 2 ? <EnterOutlined /> : <SearchOutlined />}
            onPressEnter={onSearch}
          />
        </Header>
        <Divider style={{ margin: 0 }} />
        <TopicsHistory keywords={search} onClick={onTopicClick as any} style={{ display: isShow('topics') }} />
        <TopicMessages topic={topic} style={{ display: isShow('topic') }} />
        <SearchResults
          keywords={search}
          onMessageClick={onMessageClick}
          onTopicClick={onTopicClick}
          style={{ display: isShow('search') }}
        />
        <SearchMessage message={message} style={{ display: isShow('message') }} />
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
  flex-direction: column;
  align-items: center;
  height: 100%;
  overflow-y: scroll;
`

const Header = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 8px 20px;
  padding-top: 10px;
  width: 100%;
  position: relative;
`

const HeaderLeft = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  position: absolute;
  top: 8px;
  left: 15px;
`

const MenuIcon = styled.div`
  cursor: pointer;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  &:hover {
    background-color: var(--color-background-mute);
    .anticon {
      color: var(--color-text-1);
    }
  }
`

const SearchInput = styled(Input)`
  border-radius: 30px;
  width: 800px;
  height: 36px;
`

export default TopicsPage
