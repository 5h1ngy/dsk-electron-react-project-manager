import { render, screen, waitFor } from '@testing-library/react'
import type { HealthResponse } from '@main/ipc/health'
import type { PreloadApi } from '@preload/types'
import { HealthStatusCard } from './HealthStatusCard'

const createHealthApi = (): jest.Mocked<PreloadApi['health']> => ({
  check: jest.fn<Promise<HealthResponse>, []>()
})

const createAuthApi = (): jest.Mocked<PreloadApi['auth']> => ({
  login: jest.fn(),
  logout: jest.fn(),
  session: jest.fn(),
  listUsers: jest.fn(),
  createUser: jest.fn(),
  updateUser: jest.fn()
})

describe('HealthStatusCard', () => {
  beforeEach(() => {
    window.api = {
      health: createHealthApi(),
      auth: createAuthApi()
    }
  })

  it('renders health data returned by the preload api', async () => {
    const timestamp = new Date().toISOString()
    const healthMock = window.api.health as jest.Mocked<PreloadApi['health']>
    healthMock.check.mockResolvedValueOnce({
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

    expect(healthMock.check).toHaveBeenCalledTimes(1)
  })

  it('shows an error message when the api fails', async () => {
    const healthMock = window.api.health as jest.Mocked<PreloadApi['health']>
    healthMock.check.mockResolvedValueOnce({
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
