import type { UserSummaryDTO } from '@main/services/task/types'

export interface TimeEntryDTO {
  id: string
  projectId: string
  taskId: string
  taskKey: string
  taskTitle: string
  entryDate: string
  durationMinutes: number
  description: string | null
  user: UserSummaryDTO
  createdAt: Date
  updatedAt: Date
}

export interface TimeByUserDTO {
  user: UserSummaryDTO
  minutes: number
}

export interface TimeByTaskDTO {
  taskId: string
  taskKey: string
  taskTitle: string
  minutes: number
}

export interface TimeByDateDTO {
  date: string
  minutes: number
}

export interface ProjectTimeSummaryDTO {
  projectId: string
  range: {
    from: string | null
    to: string | null
  }
  totalMinutes: number
  byUser: TimeByUserDTO[]
  byTask: TimeByTaskDTO[]
  byDate: TimeByDateDTO[]
  entries: TimeEntryDTO[]
}
