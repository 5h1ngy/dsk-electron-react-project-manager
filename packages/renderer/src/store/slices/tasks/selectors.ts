import { createSelector } from '@reduxjs/toolkit'

import type { RootState } from '@renderer/store/types'
import type { TaskDetails, TaskStatus } from '@renderer/store/slices/tasks/types'

const selectTasksState = (state: RootState) => state.tasks

export const selectTaskMutationStatus = (state: RootState) => state.tasks.mutationStatus

const emptyTasks: TaskDetails[] = []

const buildProjectSelector = (projectId: string) =>
  createSelector(selectTasksState, (state) => state.byProjectId[projectId])

export const selectProjectTasks = (projectId: string) =>
  createSelector(buildProjectSelector(projectId), (projectState): TaskDetails[] => {
    if (!projectState) {
      return emptyTasks
    }
    return projectState.ids
      .map((id) => projectState.entities[id])
      .filter((task): task is TaskDetails => Boolean(task))
  })

export const selectProjectTasksStatus = (projectId: string) =>
  createSelector(buildProjectSelector(projectId), (projectState) => projectState?.status ?? 'idle')

export const selectProjectTasksError = (projectId: string) =>
  createSelector(buildProjectSelector(projectId), (projectState) => projectState?.error)

export const selectTasksByStatus = (projectId: string, status: TaskStatus) =>
  createSelector(selectProjectTasks(projectId), (tasks) =>
    tasks
      .filter((task) => task.status === status)
      .sort((a, b) => {
        const aDate = new Date(a.createdAt).getTime()
        const bDate = new Date(b.createdAt).getTime()
        return aDate - bDate
      })
  )

export const selectTaskById = (projectId: string, taskId: string) =>
  createSelector(buildProjectSelector(projectId), (projectState) =>
    projectState ? projectState.entities[taskId] ?? null : null
  )

export const selectTaskComments = (taskId: string) =>
  createSelector(selectTasksState, (state) => state.commentsByTaskId[taskId] ?? null)

export const selectTaskSearchState = (state: RootState) => state.tasks.search
