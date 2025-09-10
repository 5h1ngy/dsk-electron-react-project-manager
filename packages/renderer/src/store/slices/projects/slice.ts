import { createEntityAdapter, createSlice, type PayloadAction } from '@reduxjs/toolkit'

import type { ProjectDetails, ProjectSummary, ProjectsState } from '@renderer/store/slices/projects/types'
import {
  addProjectMember,
  createProject,
  deleteProject,
  fetchProjectById,
  fetchProjects,
  removeProjectMember,
  updateProject
} from '@renderer/store/slices/projects/thunks'

export const projectsAdapter = createEntityAdapter<ProjectSummary>({
  selectId: (project) => project.id,
  sortComparer: (a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
})

const initialState: ProjectsState = projectsAdapter.getInitialState({
  details: {},
  listStatus: 'idle',
  mutationStatus: 'idle',
  selectedProjectId: null,
  error: undefined
})

const applyProjectDetails = (state: ProjectsState, project: ProjectDetails): void => {
  state.details[project.id] = project
  projectsAdapter.upsertOne(state, project)
}

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    selectProject: (state, action: PayloadAction<string | null>) => {
      state.selectedProjectId = action.payload
    },
    clearProjectsError: (state) => {
      state.error = undefined
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (state) => {
        state.listStatus = 'loading'
        state.error = undefined
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.listStatus = 'succeeded'
        projectsAdapter.setAll(state, action.payload)
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.listStatus = 'failed'
        state.error = action.payload ?? 'Operazione non riuscita'
      })
      .addCase(fetchProjectById.pending, (state) => {
        state.mutationStatus = 'loading'
        state.error = undefined
      })
      .addCase(fetchProjectById.fulfilled, (state, action) => {
        state.mutationStatus = 'succeeded'
        applyProjectDetails(state, action.payload)
      })
      .addCase(fetchProjectById.rejected, (state, action) => {
        state.mutationStatus = 'failed'
        state.error = action.payload ?? 'Operazione non riuscita'
      })
      .addCase(createProject.pending, (state) => {
        state.mutationStatus = 'loading'
        state.error = undefined
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.mutationStatus = 'succeeded'
        applyProjectDetails(state, action.payload)
        state.selectedProjectId = action.payload.id
      })
      .addCase(createProject.rejected, (state, action) => {
        state.mutationStatus = 'failed'
        state.error = action.payload ?? 'Operazione non riuscita'
      })
      .addCase(updateProject.pending, (state) => {
        state.mutationStatus = 'loading'
        state.error = undefined
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        state.mutationStatus = 'succeeded'
        applyProjectDetails(state, action.payload)
      })
      .addCase(updateProject.rejected, (state, action) => {
        state.mutationStatus = 'failed'
        state.error = action.payload ?? 'Operazione non riuscita'
      })
      .addCase(deleteProject.pending, (state) => {
        state.mutationStatus = 'loading'
        state.error = undefined
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.mutationStatus = 'succeeded'
        const projectId = action.payload
        projectsAdapter.removeOne(state, projectId)
        delete state.details[projectId]
        if (state.selectedProjectId === projectId) {
          state.selectedProjectId = null
        }
      })
      .addCase(deleteProject.rejected, (state, action) => {
        state.mutationStatus = 'failed'
        state.error = action.payload ?? 'Operazione non riuscita'
      })
      .addCase(addProjectMember.pending, (state) => {
        state.mutationStatus = 'loading'
        state.error = undefined
      })
      .addCase(addProjectMember.fulfilled, (state, action) => {
        state.mutationStatus = 'succeeded'
        applyProjectDetails(state, action.payload)
      })
      .addCase(addProjectMember.rejected, (state, action) => {
        state.mutationStatus = 'failed'
        state.error = action.payload ?? 'Operazione non riuscita'
      })
      .addCase(removeProjectMember.pending, (state) => {
        state.mutationStatus = 'loading'
        state.error = undefined
      })
      .addCase(removeProjectMember.fulfilled, (state, action) => {
        state.mutationStatus = 'succeeded'
        applyProjectDetails(state, action.payload)
      })
      .addCase(removeProjectMember.rejected, (state, action) => {
        state.mutationStatus = 'failed'
        state.error = action.payload ?? 'Operazione non riuscita'
      })
  }
})

export const projectsReducer = projectsSlice.reducer
export const { selectProject, clearProjectsError } = projectsSlice.actions
