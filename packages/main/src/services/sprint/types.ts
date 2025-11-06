import type { SprintSummaryDTO, TaskDetailsDTO } from '@main/services/task/types'

export interface SprintMetricsDTO {
  totalTasks: number
  estimatedMinutes: number
  statusBreakdown: Record<string, number>
}

export interface SprintDTO extends SprintSummaryDTO {
  metrics: SprintMetricsDTO
}

export interface SprintDetailsDTO extends SprintDTO {
  tasks: TaskDetailsDTO[]
}
