import { render, screen, waitFor } from '@testing-library/react'
import App from './App'

const createHealthResponse = () => ({
  ok: true,
  data: {
    status: 'healthy' as const,
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptimeSeconds: 5
  }
})

describe('App', () => {
  beforeEach(() => {
    window.api = {
      health: {
        check: jest.fn().mockResolvedValue(createHealthResponse())
      }
    }
  })

  it('renders the application shell and keeps theme in sync', async () => {
    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('DSK Project Manager')).toBeInTheDocument()
    })

    expect(document.body.dataset.theme).toBe('light')
  })
})
