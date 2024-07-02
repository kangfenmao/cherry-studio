import { findIndex, pullAt } from 'lodash'
import React, { useState } from 'react'

let id = 0
let onPop = () => {}
let onShow = ({ element, key }: { element: React.FC | React.ReactNode; key: number }) => {}
let onHide = ({ key }: { key: number }) => {}

interface Props {
  children?: React.ReactNode
}

type ElementItem = {
  key: number
  element: React.FC | React.ReactNode
}

const TopViewContainer: React.FC<Props> = ({ children }) => {
  const [elements, setElements] = useState<ElementItem[]>([])

  onPop = () => {
    const views = [...elements]
    views.pop()
    setElements(views)
  }

  onShow = ({ element, key }: { element: React.FC | React.ReactNode; key: number }) => {
    setElements(elements.concat([{ element, key }]))
  }

  onHide = ({ key }: { key: number }) => {
    const views = [...elements]
    pullAt(views, findIndex(views, { key }))
    setElements(views)
  }

  return (
    <>
      {children}
      {elements.length > 0 && (
        <div style={{ display: 'flex', flex: 1, position: 'absolute', width: '100%', height: '100%' }}>
          <div style={{ position: 'absolute', width: '100%', height: '100%' }} onClick={onPop} />
          {elements.map(({ element: Element, key }) =>
            typeof Element === 'function' ? <Element key={`TOPVIEW_${key}`} /> : Element
          )}
        </div>
      )}
    </>
  )
}

export const TopView = {
  show: (element: React.FC | React.ReactNode) => {
    id = id + 1
    onShow({ element, key: id })
    return id
  },
  hide: (key: number) => {
    onHide({ key })
  },
  pop: onPop
}

export default TopViewContainer
