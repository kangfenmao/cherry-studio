import React, { useEffect } from 'react'

import MermaidPopup from './MermaidPopup'

interface Props {
  chart: string
}

const Mermaid: React.FC<Props> = ({ chart }) => {
  useEffect(() => {
    window?.mermaid?.contentLoaded()
  }, [])

  const onPreview = () => {
    MermaidPopup.show({ chart })
  }

  return (
    <div className="mermaid" onClick={onPreview} style={{ cursor: 'pointer' }}>
      {chart}
    </div>
  )
}

export default Mermaid
