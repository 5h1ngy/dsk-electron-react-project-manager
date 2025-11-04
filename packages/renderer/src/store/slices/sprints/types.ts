import type { SprintDTO, SprintDetailsDTO } from '@main/services/sprint/types'
import type { LoadStatus } from '@renderer/store/slices/tasks/types'

export interface SprintListState {
  ids: string[]
  entities: Record<string, SprintDTO>
  status: LoadStatus
  error?: string
}

export interface SprintDetailsState {
  data: SprintDetailsDTO | null
  status: LoadStatus
  error?: string
}

export interface SprintsState {
  byProjectId: Record<string, SprintListState>
  detailsById: Record<string, SprintDetailsState>
  mutationStatus: LoadStatus
}
