import type { CSSProperties } from 'react'
import type { HealthStatus } from '@main/ipc/health'

export interface HealthStatusCardProps {
  className?: string
  cardStyle?: CSSProperties
}

export interface HealthState {
  loading: boolean
  data?: HealthStatus
  error?: string
}

export interface UseHealthStatusResult extends HealthState {
  refresh: () => Promise<void>
}

