import { omit } from 'lodash'
import React from 'react'

const Link: React.FC = (props) => {
  return <a {...omit(props, 'node')} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} />
}

export default Link
