import { omit } from 'lodash'
import React from 'react'

const Link: React.FC = (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
  if (props.href?.startsWith('#')) {
    return <span className="link">{props.children}</span>
  }

  return <a {...omit(props, 'node')} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} />
}

export default Link
