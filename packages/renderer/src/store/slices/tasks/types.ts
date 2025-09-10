import type { CommentDTO, TaskDetailsDTO } from '@main/services/task.types'

export type TaskDetails = TaskDetailsDTO
export type TaskComment = CommentDTO
export type TaskStatus = TaskDetails['status']

export type LoadStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

export interface ProjectTaskState {
  ids: string[]
  entities: Record<string, TaskDetails>
  status: LoadStatus
  error?: string
}

export interface TaskCommentsState {
  items: TaskComment[]
  status: LoadStatus
  error?: string
}

export interface TaskSearchState {
  query: string
  results: TaskDetails[]
  status: LoadStatus
  error?: string
}

export interface TasksState {
  byProjectId: Record<string, ProjectTaskState>
  commentsByTaskId: Record<string, TaskCommentsState>
  search: TaskSearchState
  mutationStatus: LoadStatus
}
