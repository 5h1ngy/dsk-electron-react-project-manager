import type { TaskPriorityInput, TaskStatusInput } from './taskValidation'

export interface UserSummaryDTO {
  id: string
  username: string
  displayName: string
}

export interface TaskDTO {
  id: string
  projectId: string
  key: string
  parentId: string | null
  title: string
  description: string | null
  status: TaskStatusInput
  priority: TaskPriorityInput
  dueDate: string | null
  assignee: UserSummaryDTO | null
  owner: UserSummaryDTO
  createdAt: Date
  updatedAt: Date
}

export interface TaskDetailsDTO extends TaskDTO {
  projectKey: string
}

export interface CommentDTO {
  id: string
  taskId: string
  author: UserSummaryDTO
  body: string
  createdAt: Date
  updatedAt: Date
}
