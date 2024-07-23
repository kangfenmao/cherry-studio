import React, { useEffect } from 'react'

interface Props {
  chart: string
}

const Mermaid: React.FC<Props> = ({ chart }) => {
  useEffect(() => {
    window?.mermaid?.contentLoaded()
  }, [])

  return <div className="mermaid">{chart}</div>
}

export default Mermaid
