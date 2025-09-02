
import { render, screen, waitFor } from '@testing-library/react'
import type { HealthResponse } from '@main/ipc/health'
import type { PreloadApi } from '@preload/types'
import { HealthStatusCard } from './HealthStatusCard'

const createHealthApi = (): jest.Mocked<PreloadApi['health']> => ({
  check: jest.fn<Promise<HealthResponse>, []>()
})

describe('HealthStatusCard', () => {
  beforeEach(() => {
    window.api = { health: createHealthApi() }
  })

  it('renders health data returned by the preload api', async () => {
    const timestamp = new Date().toISOString()
    window.api.health.check.mockResolvedValueOnce({
      ok: true,
      data: {
        status: 'healthy',
        version: '1.0.0',
        timestamp,
        uptimeSeconds: 75
      }
    })

    render(<HealthStatusCard />)

    await waitFor(() =>
      expect(screen.getByText('1.0.0', { exact: false })).toBeInTheDocument()
    )

    expect(window.api.health.check).toHaveBeenCalledTimes(1)
  })

  it('shows an error message when the api fails', async () => {
    window.api.health.check.mockResolvedValueOnce({
      ok: false,
      code: 'ERR_UNKNOWN',
      message: 'failure'
    })

    render(<HealthStatusCard />)

    await waitFor(() =>
      expect(screen.getByText(/failure/i)).toBeInTheDocument()
    )
  })
})
