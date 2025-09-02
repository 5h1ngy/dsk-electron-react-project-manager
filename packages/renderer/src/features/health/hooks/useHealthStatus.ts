import { useCallback, useEffect, useState } from 'react'
import type { HealthStatus } from '@main/ipc/health'

interface HealthState {
  loading: boolean
  data?: HealthStatus
  error?: string
}

export const useHealthStatus = () => {
  const [state, setState] = useState<HealthState>({ loading: true })

  const refresh = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: undefined }))

    try {
      const response = await window.api.health.check()

      if (response.ok) {
        setState({ loading: false, data: response.data })
        return
      }

      setState({ loading: false, error: response.message })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Errore sconosciuto'
      setState({ loading: false, error: message })
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { ...state, refresh }
}
