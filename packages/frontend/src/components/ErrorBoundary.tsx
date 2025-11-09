import { Button, Result } from 'antd'
import { Component, type ErrorInfo, type ReactNode } from 'react'

import type {
  ErrorBoundaryProps,
  ErrorBoundaryState
} from '@renderer/components/ErrorBoundary.types'

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, message: error.message }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Renderer error boundary caught an error', error, info)
  }

  private handleReload = (): void => {
    window.location.reload()
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <Result
          status="error"
          title="Si e verificato un errore"
          subTitle={this.state.message ?? "Errore inatteso nell'interfaccia renderer."}
          extra={
            <Button type="primary" onClick={this.handleReload}>
              Ricarica
            </Button>
          }
        />
      )
    }

    return this.props.children
  }
}
