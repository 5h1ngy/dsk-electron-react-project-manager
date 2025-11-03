import type { ProjectDetails } from '@renderer/store/slices/projects/types'
import type { TaskDetails } from '@renderer/store/slices/tasks/types'
import type { NoteSummary } from '@renderer/store/slices/notes/types'
import type { TaskStatusItem } from '@renderer/store/slices/taskStatuses'

export type ProjectTabKey = 'overview' | 'tasks' | 'notes'

export interface ProjectRouteContext {
  projectId: string
  project: ProjectDetails | null
  projectLoading: boolean
  refresh: () => void
  refreshTasks: () => void
  refreshTaskStatuses: () => void
  tasks: TaskDetails[]
  tasksStatus: string
  taskStatuses: TaskStatusItem[]
  taskStatusesStatus: string
  canManageTasks: boolean
  openTaskDetails: (taskId: string) => void
  openTaskCreate: (options?: {
    status?: TaskDetails['status']
    priority?: TaskDetails['priority']
  }) => void
  openTaskEdit: (taskId: string) => void
  deleteConfirmTask: TaskDetails | null
  openDeleteConfirm: (taskId: string) => void
  closeDeleteConfirm: () => void
  confirmDelete: () => Promise<void>
  deletingTaskId: string | null
  notes: NoteSummary[]
  notesStatus: string
  canManageNotes: boolean
  refreshNotes: () => void
}
