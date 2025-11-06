import type dayjs from 'dayjs'
import type { ColumnsType } from 'antd/es/table'
import type { SprintDTO } from '@main/services/sprint/types'
import type { TaskDetailsDTO } from '@main/services/task/types'

export type TimelinePosition = {
  left: string
  width: string
}

export type TaskTableRecord = {
  key: string
  title: string
  status: TaskDetailsDTO['status']
  assignee: string
  dueDate: string | null
}

export type UnassignedTaskRecord = {
  key: string
  title: string
  status: TaskDetailsDTO['status']
  priority: TaskDetailsDTO['priority']
  assignee: string
  dueDate: string | null
  estimatedMinutes: number | null
}

export type SprintStatusFilter = 'all' | SprintDTO['status']
export type ViewScale = 'week' | 'month' | 'year'

export type FormatSlotLabelResult = {
  label: string
  subLabel: string
}

export type FormatSlotLabelFn = (date: dayjs.Dayjs) => FormatSlotLabelResult

export type TaskTableColumns = ColumnsType<TaskTableRecord>

export type GroupedSprints = {
  status: SprintDTO['status']
  label: string
  sprints: SprintDTO[]
  totals: {
    tasks: number
    estimated: number
  }
}

export type SprintDetailsSelectorResult = {
  data: {
    metrics: {
      totalTasks: number
      estimatedMinutes: number | null
    }
    tasks: TaskDetailsDTO[]
  } | null
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
}

export type UnassignedTaskColumns = ColumnsType<UnassignedTaskRecord>
