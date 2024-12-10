// src/renderer/src/components/IndicatorLight.tsx
import React from 'react'
import styled from 'styled-components'

interface IndicatorLightProps {
  color: string
}

const Light = styled.div<{ color: string }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${({ color }) => color};
  box-shadow: 0 0 6px ${({ color }) => color};
  animation: pulse 2s infinite;

  @keyframes pulse {
    0% {
      opacity: 1;
    }
    50% {
      opacity: 0.6;
    }
    100% {
      opacity: 1;
    }
  }
`

const IndicatorLight: React.FC<IndicatorLightProps> = ({ color }) => {
  const actualColor = color === 'green' ? '#22c55e' : color
  return <Light color={actualColor} />
}

export default IndicatorLight
