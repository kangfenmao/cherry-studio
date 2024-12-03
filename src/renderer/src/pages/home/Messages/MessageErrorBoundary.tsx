import { Alert } from 'antd'
import React from 'react'
import { useTranslation } from 'react-i18next'

interface Props {
  fallback?: React.ReactNode
  children: React.ReactNode
}

interface State {
  hasError: boolean
}

const ErrorFallback = ({ fallback }: { fallback?: React.ReactNode }) => {
  const { t } = useTranslation()
  return (
    fallback || (
      <Alert message={t('error.render.title')} description={t('error.render.description')} type="error" showIcon />
    )
  )
}

class MessageErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback fallback={this.props.fallback} />
    }
    return this.props.children
  }
}

export default MessageErrorBoundary
