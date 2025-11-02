import type { TaskStatusDTO } from '@main/services/taskStatus/types'
import type { LoadStatus } from '@renderer/store/slices/tasks/types'

export type TaskStatusItem = TaskStatusDTO

export interface ProjectTaskStatusesState {
  items: TaskStatusItem[]
  status: LoadStatus
  error?: string
}

export interface TaskStatusesState {
  byProjectId: Record<string, ProjectTaskStatusesState>
  mutationStatus: LoadStatus
  error?: string
}
