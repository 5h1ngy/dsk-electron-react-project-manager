import type { TaskDetails } from '@renderer/store/slices/tasks/types'

export interface ProjectOverviewPageProps {}

export interface ProjectMetricTotals {
  total: number
  active: number
  done: number
  overdue: number
  dueSoon: number
  unassigned: number
}

export interface DistributionItem {
  key: string
  count: number
}

export interface AssigneeWorkloadEntry {
  id: string
  name: string
  count: number
  isUnassigned: boolean
}

export interface TrendPoint {
  date: string
  label: string
  count: number
}

export interface ProjectInsights {
  totals: ProjectMetricTotals
  statusDistribution: DistributionItem[]
  priorityDistribution: DistributionItem[]
  assigneeWorkload: AssigneeWorkloadEntry[]
  completionTrend: TrendPoint[]
  upcomingTasks: TaskDetails[]
  overdueTasks: TaskDetails[]
}
