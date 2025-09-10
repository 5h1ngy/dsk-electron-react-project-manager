import { createSelector } from '@reduxjs/toolkit'

import type { RootState } from '@renderer/store/types'
import { projectsAdapter } from '@renderer/store/slices/projects/slice'

const selectProjectsState = (state: RootState) => state.projects

const adapterSelectors = projectsAdapter.getSelectors(selectProjectsState)

export const selectProjects = (state: RootState) => adapterSelectors.selectAll(state)
export const selectProjectsMap = (state: RootState) => adapterSelectors.selectEntities(state)
export const selectProjectsStatus = (state: RootState) => state.projects.listStatus
export const selectProjectsError = (state: RootState) => state.projects.error
export const selectProjectsMutationStatus = (state: RootState) => state.projects.mutationStatus

export const selectSelectedProjectId = (state: RootState) => state.projects.selectedProjectId

export const selectSelectedProject = createSelector(
  selectProjectsState,
  selectSelectedProjectId,
  (state, selectedId) => (selectedId ? state.details[selectedId] ?? null : null)
)

export const selectProjectById = (projectId: string) =>
  createSelector(selectProjectsState, (state) => state.details[projectId] ?? state.entities[projectId] ?? null)
