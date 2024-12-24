import { ReactNode } from 'react'
import styled from 'styled-components'

interface ListItemProps {
  active?: boolean
  icon?: ReactNode
  title: string
  onClick?: () => void
}

const ListItem = ({ active, icon, title, onClick }: ListItemProps) => {
  return (
    <ListItemContainer className={active ? 'active' : ''} onClick={onClick}>
      <ListItemContent>
        {icon && <span style={{ marginRight: '8px' }}>{icon}</span>}
        {title}
      </ListItemContent>
    </ListItemContainer>
  )
}

const ListItemContainer = styled.div`
  padding: 7px 12px;
  border-radius: 16px;
  font-size: 13px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  font-family: Ubuntu;
  cursor: pointer;
  border: 1px solid transparent;

  &:hover {
    background-color: var(--color-background-soft);
  }

  &.active {
    background-color: var(--color-background-soft);
    border: 1px solid var(--color-border-soft);
  }
`

const ListItemContent = styled.div`
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-size: 13px;
`

export default ListItem
