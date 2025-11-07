import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { HealthStatusCard } from '@renderer/components/HealthStatusCard'

jest.mock('@renderer/components/HealthStatusCard.hooks', () => ({
  useHealthStatus: jest.fn()
}))

const mockUseHealthStatus = jest.requireMock('@renderer/components/HealthStatusCard.hooks')
  .useHealthStatus as jest.Mock

describe('HealthStatusCard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders health information when available', () => {
    const refresh = jest.fn()
    mockUseHealthStatus.mockReturnValue({
      loading: false,
      refresh,
      error: undefined,
      data: {
        status: 'healthy',
        version: process.env.APP_VERSION ?? '0.0.0',
        timestamp: new Date('2025-01-01T00:00:00.000Z').toISOString(),
        uptimeSeconds: 125
      }
    })

    render(<HealthStatusCard />)

    expect(screen.getByText('Versione:')).toBeInTheDocument()
    expect(screen.getByText(process.env.APP_VERSION ?? '0.0.0')).toBeInTheDocument()
    expect(screen.getByText('2m 5s')).toBeInTheDocument()
    expect(screen.getByText('healthy')).toBeInTheDocument()
  })

  it('renders error message when health check fails', () => {
    mockUseHealthStatus.mockReturnValue({
      loading: false,
      refresh: jest.fn(),
      error: 'Errore di rete',
      data: undefined
    })

    render(<HealthStatusCard />)

    expect(screen.getByText('Errore di rete')).toBeInTheDocument()
  })

  it('calls refresh when requested', async () => {
    const refresh = jest.fn()
    mockUseHealthStatus.mockReturnValue({
      loading: false,
      refresh,
      error: undefined,
      data: {
        status: 'healthy',
        version: process.env.APP_VERSION ?? '0.0.0',
        timestamp: new Date().toISOString(),
        uptimeSeconds: 10
      }
    })

    render(<HealthStatusCard />)

    await userEvent.click(screen.getByRole('button', { name: 'Aggiorna stato' }))

    expect(refresh).toHaveBeenCalled()
  })
})
