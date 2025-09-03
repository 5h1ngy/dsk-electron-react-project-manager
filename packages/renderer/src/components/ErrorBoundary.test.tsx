import { render } from '@testing-library/react'
import { screen } from '@testing-library/dom'
import { ErrorBoundary } from './ErrorBoundary'

const ProblemChild = () => {
  throw new Error('Failure')
}

const SafeChild = () => <div>ok</div>

describe('ErrorBoundary', () => {
  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <SafeChild />
      </ErrorBoundary>
    )

    expect(screen.getByText('ok')).toBeInTheDocument()
  })

  it('shows fallback when a child throws', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined)
    render(
      <ErrorBoundary>
        <ProblemChild />
      </ErrorBoundary>
    )

    expect(screen.getByText(/Si e verificato/i)).toBeInTheDocument()
    consoleSpy.mockRestore()
  })
})
