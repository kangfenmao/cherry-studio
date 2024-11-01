import { PlusOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

interface AddAgentCardProps {
  onClick: () => void
  className?: string
}

const AddAgentCard = ({ onClick, className }: AddAgentCardProps) => {
  const { t } = useTranslation()

  return (
    <StyledCard className={className} onClick={onClick}>
      <PlusOutlined style={{ fontSize: 24 }} />
      <span style={{ marginTop: 10 }}>{t('agents.add.title')}</span>
    </StyledCard>
  )
}

const StyledCard = styled.div`
  width: 100%;
  height: 180px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: var(--color-background);
  border-radius: 15px;
  border: 1px dashed var(--color-border);
  cursor: pointer;
  transition: all 0.3s ease;
  color: var(--color-text-soft);

  &:hover {
    border-color: var(--color-primary);
    color: var(--color-primary);
  }
`

export default AddAgentCard
