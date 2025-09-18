import type { ProjectDetails } from '@renderer/store/slices/projects/types'
import type { TaskDetails } from '@renderer/store/slices/tasks/types'
import type { NoteSummary } from '@renderer/store/slices/notes/types'

export type ProjectTabKey = 'overview' | 'tasks' | 'board' | 'notes'

export interface ProjectRouteContext {
  projectId: string
  project: ProjectDetails | null
  projectLoading: boolean
  refresh: () => void
  tasks: TaskDetails[]
  tasksStatus: string
  canManageTasks: boolean
  openTaskDetails: (taskId: string) => void
  openTaskCreate: (options?: { status?: TaskDetails['status']; priority?: TaskDetails['priority'] }) => void
  openTaskEdit: (taskId: string) => void
  deleteTask: (taskId: string) => Promise<void>
  deletingTaskId: string | null
  notes: NoteSummary[]
  notesStatus: string
  canManageNotes: boolean
  refreshNotes: () => void
}
