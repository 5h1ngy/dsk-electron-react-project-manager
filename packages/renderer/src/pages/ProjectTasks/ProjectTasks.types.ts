import type { TaskDetails } from '@renderer/store/slices/tasks/types'

export interface ProjectTasksPageProps {}

export interface SelectOption {
  value: string
  label: string
}

export interface TaskFilters {
  searchQuery: string
  status: 'all' | TaskDetails['status']
  priority: 'all' | TaskDetails['priority']
  assignee: 'all' | 'unassigned' | string
  dueDateRange: [string | null, string | null] | null
}
