import type { ProjectTimeSummaryInput } from '@main/services/timeTracking/schemas'
import type { ProjectTimeSummaryDTO, TimeEntryDTO } from '@main/services/timeTracking/types'
import type { LoadStatus } from '@renderer/store/slices/tasks/types'

export interface TimeSummaryState {
  summary: ProjectTimeSummaryDTO | null
  status: LoadStatus
  error?: string
  filters: ProjectTimeSummaryInput | null
}

export interface TimeTrackingState {
  byProjectId: Record<string, TimeSummaryState>
  mutationStatus: LoadStatus
  mutationError?: string
  lastEntry?: TimeEntryDTO | null
}
