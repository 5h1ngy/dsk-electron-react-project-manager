import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ErrorBoundary } from '@renderer/components/ErrorBoundary'

const ProblemChild = () => {
  throw new Error('Boom')
}

beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => undefined)
})

afterEach(() => {
  ;(console.error as jest.Mock).mockRestore()
})

describe('ErrorBoundary', () => {
  it('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <div>All good</div>
      </ErrorBoundary>
    )

    expect(screen.getByText('All good')).toBeInTheDocument()
  })

  it('renders fallback when an error is thrown', async () => {
    render(
      <ErrorBoundary>
        <ProblemChild />
      </ErrorBoundary>
    )

    expect(screen.getByText('Si e verificato un errore')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Ricarica' }))
  })
})
