import { createSlice } from '@reduxjs/toolkit'

import {
  createTaskStatus,
  deleteTaskStatus,
  fetchTaskStatuses,
  reorderTaskStatuses,
  updateTaskStatus
} from '@renderer/store/slices/taskStatuses/thunks'
import type {
  ProjectTaskStatusesState,
  TaskStatusesState,
  TaskStatusItem
} from '@renderer/store/slices/taskStatuses/types'

const initialProjectState = (): ProjectTaskStatusesState => ({
  items: [],
  status: 'idle',
  error: undefined
})

const sortStatuses = (items: TaskStatusItem[]): TaskStatusItem[] =>
  [...items].sort((a, b) => a.position - b.position)

const initialState: TaskStatusesState = {
  byProjectId: {},
  mutationStatus: 'idle',
  error: undefined
}

const taskStatusesSlice = createSlice({
  name: 'taskStatuses',
  initialState,
  reducers: {
    resetTaskStatuses(state, action: { payload: { projectId: string } }) {
      const { projectId } = action.payload
      delete state.byProjectId[projectId]
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTaskStatuses.pending, (state, action) => {
        const projectId = action.meta.arg
        const projectState =
          state.byProjectId[projectId] ?? (state.byProjectId[projectId] = initialProjectState())
        projectState.status = 'loading'
        projectState.error = undefined
      })
      .addCase(fetchTaskStatuses.fulfilled, (state, action) => {
        const { projectId, statuses } = action.payload
        const projectState =
          state.byProjectId[projectId] ?? (state.byProjectId[projectId] = initialProjectState())
        projectState.status = 'succeeded'
        projectState.items = sortStatuses(statuses)
      })
      .addCase(fetchTaskStatuses.rejected, (state, action) => {
        const projectId = action.meta.arg
        const projectState =
          state.byProjectId[projectId] ?? (state.byProjectId[projectId] = initialProjectState())
        projectState.status = 'failed'
        projectState.error = action.payload ?? action.error.message ?? 'Errore caricamento stati'
      })

    builder
      .addCase(createTaskStatus.pending, (state) => {
        state.mutationStatus = 'loading'
        state.error = undefined
      })
      .addCase(createTaskStatus.fulfilled, (state, action) => {
        const status = action.payload
        const projectState =
          state.byProjectId[status.projectId] ??
          (state.byProjectId[status.projectId] = initialProjectState())
        projectState.items = sortStatuses([...projectState.items, status])
        projectState.status = 'succeeded'
        state.mutationStatus = 'succeeded'
      })
      .addCase(createTaskStatus.rejected, (state, action) => {
        state.mutationStatus = 'failed'
        state.error = action.payload ?? action.error.message ?? 'Errore creazione stato'
      })

    builder
      .addCase(updateTaskStatus.pending, (state) => {
        state.mutationStatus = 'loading'
        state.error = undefined
      })
      .addCase(updateTaskStatus.fulfilled, (state, action) => {
        const status = action.payload
        const projectState =
          state.byProjectId[status.projectId] ??
          (state.byProjectId[status.projectId] = initialProjectState())
        projectState.items = sortStatuses(
          projectState.items.map((item) => (item.id === status.id ? status : item))
        )
        projectState.status = 'succeeded'
        state.mutationStatus = 'succeeded'
      })
      .addCase(updateTaskStatus.rejected, (state, action) => {
        state.mutationStatus = 'failed'
        state.error = action.payload ?? action.error.message ?? 'Errore aggiornamento stato'
      })

    builder
      .addCase(reorderTaskStatuses.pending, (state) => {
        state.mutationStatus = 'loading'
        state.error = undefined
      })
      .addCase(reorderTaskStatuses.fulfilled, (state, action) => {
        const { projectId, statuses } = action.payload
        const projectState =
          state.byProjectId[projectId] ?? (state.byProjectId[projectId] = initialProjectState())
        projectState.items = sortStatuses(statuses)
        projectState.status = 'succeeded'
        state.mutationStatus = 'succeeded'
      })
      .addCase(reorderTaskStatuses.rejected, (state, action) => {
        state.mutationStatus = 'failed'
        state.error = action.payload ?? action.error.message ?? 'Errore riordino stati'
      })

    builder
      .addCase(deleteTaskStatus.pending, (state) => {
        state.mutationStatus = 'loading'
        state.error = undefined
      })
      .addCase(deleteTaskStatus.fulfilled, (state, action) => {
        const { projectId, statusId } = action.payload
        const projectState =
          state.byProjectId[projectId] ?? (state.byProjectId[projectId] = initialProjectState())
        projectState.items = projectState.items.filter((item) => item.id !== statusId)
        state.mutationStatus = 'succeeded'
      })
      .addCase(deleteTaskStatus.rejected, (state, action) => {
        state.mutationStatus = 'failed'
        state.error = action.payload ?? action.error.message ?? 'Errore eliminazione stato'
      })
  }
})

export const { resetTaskStatuses } = taskStatusesSlice.actions
export const taskStatusesReducer = taskStatusesSlice.reducer
