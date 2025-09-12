import type { ProjectDetails } from '@renderer/store/slices/projects/types'
import type { TaskDetails } from '@renderer/store/slices/tasks/types'

export type ProjectTabKey = 'overview' | 'tasks' | 'board'

export interface ProjectRouteContext {
  projectId: string
  project: ProjectDetails | null
  tasks: TaskDetails[]
  tasksStatus: string
  projectLoading: boolean
  refresh: () => void
  canManageTasks: boolean
  openTaskDetails: (taskId: string) => void
  openTaskCreate: (options?: { status?: TaskDetails['status']; priority?: TaskDetails['priority'] }) => void
  openTaskEdit: (taskId: string) => void
  deleteTask: (taskId: string) => Promise<void>
  deletingTaskId: string | null
}
