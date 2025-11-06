import type { TaskPriorityInput, TaskStatusInput } from '@main/services/task/schemas'
import type { SprintStatus } from '@main/models/Sprint'

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
  sprintId: string | null
  sprint: SprintSummaryDTO | null
  estimatedMinutes: number | null
  createdAt: Date
  updatedAt: Date
}

export interface TaskNoteLinkDTO {
  id: string
  title: string
  isPrivate: boolean
  ownerId: string
}

export interface TaskDetailsDTO extends TaskDTO {
  projectKey: string
  linkedNotes: TaskNoteLinkDTO[]
  commentCount: number
}

export interface CommentDTO {
  id: string
  taskId: string
  author: UserSummaryDTO
  body: string
  createdAt: Date
  updatedAt: Date
}

export interface SprintSummaryDTO {
  id: string
  projectId: string
  name: string
  status: SprintStatus
  startDate: string
  endDate: string
  goal: string | null
  capacityMinutes: number | null
  sequence: number
}
