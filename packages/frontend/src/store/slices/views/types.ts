import type { SavedViewDTO } from '@services/services/view/types'
import type { LoadStatus } from '@renderer/store/slices/tasks/types'

export type SavedView = SavedViewDTO

export interface ProjectViewsState {
  items: SavedView[]
  status: LoadStatus
  error?: string
  selectedId: string | null
}

export interface ViewsState {
  byProjectId: Record<string, ProjectViewsState>
  mutationStatus: LoadStatus
  error?: string
}
