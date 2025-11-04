import { createSlice } from '@reduxjs/toolkit'

import type { TimeSummaryState, TimeTrackingState } from '@renderer/store/slices/timeTracking/types'
import {
  deleteTimeEntry,
  fetchProjectTimeSummary,
  logTimeEntry,
  updateTimeEntry
} from '@renderer/store/slices/timeTracking/thunks'

const createInitialSummaryState = (): TimeSummaryState => ({
  summary: null,
  status: 'idle',
  error: undefined,
  filters: null
})

const initialState: TimeTrackingState = {
  byProjectId: {},
  mutationStatus: 'idle',
  mutationError: undefined,
  lastEntry: null
}

const ensureProjectSummary = (state: TimeTrackingState, projectId: string): TimeSummaryState => {
  if (!state.byProjectId[projectId]) {
    state.byProjectId[projectId] = createInitialSummaryState()
  }
  return state.byProjectId[projectId]!
}

const timeTrackingSlice = createSlice({
  name: 'timeTracking',
  initialState,
  reducers: {
    resetTimeTrackingMutation(state) {
      state.mutationStatus = 'idle'
      state.mutationError = undefined
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjectTimeSummary.pending, (state, action) => {
        const projectState = ensureProjectSummary(state, action.meta.arg.projectId)
        projectState.status = 'loading'
        projectState.error = undefined
      })
      .addCase(fetchProjectTimeSummary.fulfilled, (state, action) => {
        const { projectId, summary, filters } = action.payload
        const projectState = ensureProjectSummary(state, projectId)
        projectState.summary = summary
        projectState.status = 'succeeded'
        projectState.error = undefined
        projectState.filters = filters
      })
      .addCase(fetchProjectTimeSummary.rejected, (state, action) => {
        const projectState = ensureProjectSummary(state, action.meta.arg.projectId)
        projectState.status = 'failed'
        projectState.error = action.payload ?? 'Impossibile caricare i report di tempo'
      })

      .addCase(logTimeEntry.pending, (state) => {
        state.mutationStatus = 'loading'
        state.mutationError = undefined
      })
      .addCase(logTimeEntry.fulfilled, (state, action) => {
        state.mutationStatus = 'succeeded'
        state.mutationError = undefined
        state.lastEntry = action.payload
      })
      .addCase(logTimeEntry.rejected, (state, action) => {
        state.mutationStatus = 'failed'
        state.mutationError = action.payload ?? 'Registrazione tempo non riuscita'
      })

      .addCase(updateTimeEntry.pending, (state) => {
        state.mutationStatus = 'loading'
        state.mutationError = undefined
      })
      .addCase(updateTimeEntry.fulfilled, (state, action) => {
        state.mutationStatus = 'succeeded'
        state.mutationError = undefined
        state.lastEntry = action.payload
      })
      .addCase(updateTimeEntry.rejected, (state, action) => {
        state.mutationStatus = 'failed'
        state.mutationError = action.payload ?? 'Aggiornamento tempo non riuscito'
      })

      .addCase(deleteTimeEntry.pending, (state) => {
        state.mutationStatus = 'loading'
        state.mutationError = undefined
      })
      .addCase(deleteTimeEntry.fulfilled, (state) => {
        state.mutationStatus = 'succeeded'
        state.mutationError = undefined
      })
      .addCase(deleteTimeEntry.rejected, (state, action) => {
        state.mutationStatus = 'failed'
        state.mutationError = action.payload ?? 'Eliminazione tempo non riuscita'
      })
  }
})

export const { resetTimeTrackingMutation } = timeTrackingSlice.actions
export const timeTrackingReducer = timeTrackingSlice.reducer
