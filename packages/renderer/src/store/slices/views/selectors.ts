import { createSelector } from '@reduxjs/toolkit'

import type { RootState } from '@renderer/store/types'
import type { ProjectViewsState } from '@renderer/store/slices/views/types'

const DEFAULT_PROJECT_STATE: ProjectViewsState = {
  items: [],
  status: 'idle',
  selectedId: null
}

export const selectViewsState = (state: RootState) => state.views

export const selectProjectViewsState = (projectId: string) =>
  createSelector(selectViewsState, (state) => state.byProjectId[projectId] ?? DEFAULT_PROJECT_STATE)

export const selectProjectSavedViews = (projectId: string) =>
  createSelector(selectProjectViewsState(projectId), (state) => state.items)

export const selectProjectViewsStatus = (projectId: string) =>
  createSelector(selectProjectViewsState(projectId), (state) => state.status)

export const selectProjectViewsError = (projectId: string) =>
  createSelector(selectProjectViewsState(projectId), (state) => state.error)

export const selectSelectedViewId = (projectId: string) =>
  createSelector(selectProjectViewsState(projectId), (state) => state.selectedId)

export const selectViewsMutationStatus = createSelector(
  selectViewsState,
  (state) => state.mutationStatus
)

