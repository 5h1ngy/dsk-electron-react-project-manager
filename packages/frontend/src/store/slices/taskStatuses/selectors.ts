import { createSelector } from '@reduxjs/toolkit'

import type { RootState } from '@renderer/store/types'

const selectSlice = (state: RootState) => state.taskStatuses

export const selectTaskStatusesMutationStatus = createSelector(
  selectSlice,
  (state) => state.mutationStatus
)

export const selectTaskStatusesError = createSelector(selectSlice, (state) => state.error)

export const selectProjectTaskStatuses = (projectId: string) =>
  createSelector(selectSlice, (state) => state.byProjectId[projectId]?.items ?? [])

export const selectProjectTaskStatusesStatus = (projectId: string) =>
  createSelector(selectSlice, (state) => state.byProjectId[projectId]?.status ?? 'idle')
