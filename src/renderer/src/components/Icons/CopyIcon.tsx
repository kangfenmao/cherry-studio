import { FC } from 'react'

const CopyIcon: FC<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>> = (props) => {
  return <i {...props} className={`iconfont icon-copy ${props.className}`} />
}

export default CopyIcon
