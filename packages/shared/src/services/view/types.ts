import type { TaskPriority, TaskStatus } from '@services/models/Task'
import type { CreateViewInput } from '@services/services/view/schemas'

export type ViewFilterState = {
  searchQuery: string
  status: 'all' | TaskStatus
  priority: 'all' | TaskPriority
  assignee: 'all' | 'unassigned' | string
  sprint: 'all' | 'backlog' | string
  dueDateRange: [string | null, string | null] | null
}

export type ViewSortState = {
  field: NonNullable<CreateViewInput['sort']>['field']
  direction: NonNullable<CreateViewInput['sort']>['direction']
}

export interface SavedViewDTO {
  id: string
  projectId: string
  userId: string
  name: string
  filters: ViewFilterState
  sort: ViewSortState | null
  columns: string[]
  createdAt: string
  updatedAt: string
}
