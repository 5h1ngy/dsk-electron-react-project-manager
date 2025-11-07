import { createSlice } from '@reduxjs/toolkit'

import type { SprintDTO } from '@services/services/sprint/types'
import type { SprintListState, SprintsState } from '@renderer/store/slices/sprints/types'
import {
  createSprint,
  deleteSprint,
  fetchSprintDetails,
  fetchSprints,
  updateSprint
} from '@renderer/store/slices/sprints/thunks'

const createInitialProjectState = (): SprintListState => ({
  ids: [],
  entities: {},
  status: 'idle',
  error: undefined
})

const initialState: SprintsState = {
  byProjectId: {},
  detailsById: {},
  mutationStatus: 'idle'
}

const sprintsSlice = createSlice({
  name: 'sprints',
  initialState,
  reducers: {
    resetSprintMutationStatus(state) {
      state.mutationStatus = 'idle'
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSprints.pending, (state, action) => {
        const projectId = action.meta.arg
        if (!state.byProjectId[projectId]) {
          state.byProjectId[projectId] = createInitialProjectState()
        }
        const projectState = state.byProjectId[projectId]
        projectState.status = 'loading'
        projectState.error = undefined
      })
      .addCase(fetchSprints.fulfilled, (state, action) => {
        const { projectId, sprints } = action.payload
        if (!state.byProjectId[projectId]) {
          state.byProjectId[projectId] = createInitialProjectState()
        }
        const projectState = state.byProjectId[projectId]
        projectState.ids = sprints.map((sprint) => sprint.id)
        projectState.entities = sprints.reduce<Record<string, SprintDTO>>((acc, sprint) => {
          acc[sprint.id] = sprint
          return acc
        }, {})
        projectState.status = 'succeeded'
        projectState.error = undefined
      })
      .addCase(fetchSprints.rejected, (state, action) => {
        const projectId = action.meta.arg
        if (!state.byProjectId[projectId]) {
          state.byProjectId[projectId] = createInitialProjectState()
        }
        const projectState = state.byProjectId[projectId]
        projectState.status = 'failed'
        projectState.error = action.payload ?? 'Errore nel recupero degli sprint'
      })

      .addCase(fetchSprintDetails.pending, (state, action) => {
        const sprintId = action.meta.arg
        if (!state.detailsById[sprintId]) {
          state.detailsById[sprintId] = { data: null, status: 'idle', error: undefined }
        }
        state.detailsById[sprintId]!.status = 'loading'
        state.detailsById[sprintId]!.error = undefined
      })
      .addCase(fetchSprintDetails.fulfilled, (state, action) => {
        const sprint = action.payload
        state.detailsById[sprint.id] = {
          data: sprint,
          status: 'succeeded',
          error: undefined
        }
        if (!state.byProjectId[sprint.projectId]) {
          state.byProjectId[sprint.projectId] = createInitialProjectState()
        }
        const projectState = state.byProjectId[sprint.projectId]
        if (!projectState.entities[sprint.id]) {
          projectState.ids.push(sprint.id)
        }
        const { tasks: _unusedTasks, ...summary } = sprint as typeof sprint & { tasks?: unknown }
        void _unusedTasks
        projectState.entities[sprint.id] = {
          ...projectState.entities[sprint.id],
          ...(summary as SprintDTO)
        }
      })
      .addCase(fetchSprintDetails.rejected, (state, action) => {
        const sprintId = action.meta.arg
        if (!state.detailsById[sprintId]) {
          state.detailsById[sprintId] = { data: null, status: 'idle', error: undefined }
        }
        state.detailsById[sprintId]!.status = 'failed'
        state.detailsById[sprintId]!.error = action.payload ?? 'Errore nel recupero dello sprint'
      })

      .addCase(createSprint.pending, (state) => {
        state.mutationStatus = 'loading'
      })
      .addCase(createSprint.fulfilled, (state, action) => {
        const sprint = action.payload
        state.mutationStatus = 'succeeded'
        if (!state.byProjectId[sprint.projectId]) {
          state.byProjectId[sprint.projectId] = createInitialProjectState()
        }
        const projectState = state.byProjectId[sprint.projectId]
        if (!projectState.ids.includes(sprint.id)) {
          projectState.ids.push(sprint.id)
        }
        projectState.entities[sprint.id] = sprint
        projectState.status = 'succeeded'
      })
      .addCase(createSprint.rejected, (state, action) => {
        state.mutationStatus = 'failed'
        const message = action.payload ?? 'Creazione sprint non riuscita'
        // store general error on all project states? store on mutation?
        Object.values(state.byProjectId).forEach((projectState) => {
          if (projectState.status === 'failed') {
            projectState.error = message
          }
        })
      })

      .addCase(updateSprint.pending, (state) => {
        state.mutationStatus = 'loading'
      })
      .addCase(updateSprint.fulfilled, (state, action) => {
        const sprint = action.payload
        state.mutationStatus = 'succeeded'
        if (!state.byProjectId[sprint.projectId]) {
          state.byProjectId[sprint.projectId] = createInitialProjectState()
        }
        const projectState = state.byProjectId[sprint.projectId]
        if (!projectState.ids.includes(sprint.id)) {
          projectState.ids.push(sprint.id)
        }
        projectState.entities[sprint.id] = sprint
        const details = state.detailsById[sprint.id]
        if (details?.data) {
          details.data = {
            ...details.data,
            ...sprint
          }
        }
      })
      .addCase(updateSprint.rejected, (state, action) => {
        state.mutationStatus = 'failed'
        const message = action.payload ?? 'Aggiornamento sprint non riuscito'
        Object.values(state.byProjectId).forEach((projectState) => {
          if (projectState.status === 'failed') {
            projectState.error = message
          }
        })
      })

      .addCase(deleteSprint.pending, (state) => {
        state.mutationStatus = 'loading'
      })
      .addCase(deleteSprint.fulfilled, (state, action) => {
        const { projectId, sprintId } = action.payload
        state.mutationStatus = 'succeeded'
        const projectState = state.byProjectId[projectId]
        if (projectState) {
          projectState.ids = projectState.ids.filter((id) => id !== sprintId)
          delete projectState.entities[sprintId]
        }
        delete state.detailsById[sprintId]
      })
      .addCase(deleteSprint.rejected, (state, action) => {
        state.mutationStatus = 'failed'
        const message = action.payload ?? 'Eliminazione sprint non riuscita'
        Object.values(state.byProjectId).forEach((projectState) => {
          if (projectState.status === 'failed') {
            projectState.error = message
          }
        })
      })
  }
})

export const { resetSprintMutationStatus } = sprintsSlice.actions
export const sprintsReducer = sprintsSlice.reducer
