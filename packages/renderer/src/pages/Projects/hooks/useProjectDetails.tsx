import { useCallback, useEffect, useMemo } from 'react'
import { message } from 'antd'

import { useAppDispatch, useAppSelector } from '@renderer/store/hooks'
import {
  fetchProjectById,
  selectProjectById,
  selectProjectsError,
  selectProjectsStatus
} from '@renderer/store/slices/projects'
import { fetchTasks, selectProjectTasks, selectProjectTasksStatus } from '@renderer/store/slices/tasks'
import type { TaskDetails, LoadStatus } from '@renderer/store/slices/tasks'
import { selectCurrentUser } from '@renderer/store/slices/auth/selectors'
import {
  fetchNotes,
  selectProjectNotes,
  selectProjectNotesStatus
} from '@renderer/store/slices/notes'
import type { NoteSummary } from '@renderer/store/slices/notes/types'

export interface UseProjectDetailsResult {
  project: ReturnType<ReturnType<typeof selectProjectById>> | null
  tasks: TaskDetails[]
  tasksStatus: ReturnType<ReturnType<typeof selectProjectTasksStatus>>
  projectLoading: boolean
  refresh: () => void
  canManageTasks: boolean
  notes: NoteSummary[]
  notesStatus: ReturnType<ReturnType<typeof selectProjectNotesStatus>>
  canManageNotes: boolean
  refreshNotes: () => void
  messageContext: React.ReactNode
}

export const useProjectDetails = (projectId?: string): UseProjectDetailsResult => {
  const dispatch = useAppDispatch()
  const [messageApi, messageContext] = message.useMessage()

  const projectSelector = useMemo(() => (projectId ? selectProjectById(projectId) : () => null), [projectId])
  const tasksSelector = useMemo(
    () => (projectId ? selectProjectTasks(projectId) : () => []),
    [projectId]
  )
  const notesSelector = useMemo(
    () => (projectId ? selectProjectNotes(projectId) : () => []),
    [projectId]
  )
  const tasksStatusSelector = useMemo(
    () =>
      projectId
        ? selectProjectTasksStatus(projectId)
        : (() => 'idle' as LoadStatus),
    [projectId]
  )

  const project = useAppSelector(projectSelector)
  const tasks = useAppSelector(tasksSelector)
  const tasksStatus = useAppSelector(tasksStatusSelector)
  const notesStatusSelector = useMemo(
    () =>
      projectId
        ? selectProjectNotesStatus(projectId)
        : (() => 'idle' as LoadStatus),
    [projectId]
  )
  const notes = useAppSelector(notesSelector)
  const notesStatus = useAppSelector(notesStatusSelector)
  const projectsStatus = useAppSelector(selectProjectsStatus)
  const error = useAppSelector(selectProjectsError)
  const currentUser = useAppSelector(selectCurrentUser)

  const canManageProjects = useMemo(
    () => (currentUser?.roles ?? []).some((role) => role === 'Admin' || role === 'Maintainer'),
    [currentUser?.roles]
  )

  const canManageTasks = useMemo(() => {
    if (canManageProjects) {
      return true
    }
    if (!project) {
      return false
    }
    return project.role === 'admin' || project.role === 'edit'
  }, [canManageProjects, project])

  useEffect(() => {
    if (!projectId) {
      return
    }
    void dispatch(fetchProjectById(projectId))
    void dispatch(fetchTasks(projectId))
    void dispatch(fetchNotes({ projectId }))
  }, [dispatch, projectId])

  useEffect(() => {
    if (error) {
      messageApi.error(error)
    }
  }, [error, messageApi])

  const refresh = useCallback(() => {
    if (!projectId) {
      return
    }
    void dispatch(fetchProjectById(projectId))
    void dispatch(fetchTasks(projectId))
    void dispatch(fetchNotes({ projectId }))
  }, [dispatch, projectId])

  const refreshNotes = useCallback(() => {
    if (!projectId) {
      return
    }
    void dispatch(fetchNotes({ projectId }))
  }, [dispatch, projectId])

  const projectLoading = !project && projectsStatus === 'loading'

  return {
    project,
    tasks,
    tasksStatus,
    projectLoading,
    refresh,
    canManageTasks,
    notes,
    notesStatus,
    canManageNotes: canManageTasks,
    refreshNotes,
    messageContext
  }
}
