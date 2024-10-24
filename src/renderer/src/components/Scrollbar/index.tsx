import { ScrollbarProps, Scrollbars } from 'react-custom-scrollbars-2'
import styled from 'styled-components'

export const Scrollbar: React.FC<ScrollbarProps> = ({ children, ...props }) => {
  return (
    <Scrollbars
      autoHide
      {...props}
      renderThumbVertical={(props) => <Thumb {...props} />}
      renderTrackHorizontal={(props) => <Thumb {...props} />}>
      {children}
    </Scrollbars>
  )
}

const Thumb = styled.div`
  border-radius: 10px;
  background-color: var(--color-scrollbar-thumb);
  &:hover {
    background-color: var(--color-scrollbar-thumb-hover);
  }
`
