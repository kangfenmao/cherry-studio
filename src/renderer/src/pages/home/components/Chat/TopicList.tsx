import { useShowRightSidebar } from '@renderer/hooks/useStore'
import { FC } from 'react'
import styled from 'styled-components'

const TopicList: FC = () => {
  const { showRightSidebar } = useShowRightSidebar()

  return <Container className={showRightSidebar ? '' : 'collapsed'}></Container>
}

const Container = styled.div`
  width: var(--topic-list-width);
  height: 100%;
  border-left: 0.5px solid #ffffff20;
  &.collapsed {
    width: 0;
    border-left: none;
  }
`

export default TopicList
