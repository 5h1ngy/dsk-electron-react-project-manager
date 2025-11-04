import type { RootState } from '@renderer/store/types'
import type { TimeSummaryState } from '@renderer/store/slices/timeTracking/types'
import type { TimeEntryDTO } from '@main/services/timeTracking/types'

const emptySummaryState: TimeSummaryState = Object.freeze({
  summary: null,
  status: 'idle',
  error: undefined,
  filters: null
})

export const selectTimeTrackingState = (state: RootState) => state.timeTracking

export const selectTimeSummaryForProject =
  (projectId: string) =>
  (state: RootState): TimeSummaryState =>
    state.timeTracking.byProjectId[projectId] ?? emptySummaryState

export const selectTimeSummaryEntries =
  (projectId: string) =>
  (state: RootState): TimeEntryDTO[] =>
    selectTimeSummaryForProject(projectId)(state).summary?.entries ?? []

export const selectTimeSummaryStatus = (projectId: string) => (state: RootState) =>
  selectTimeSummaryForProject(projectId)(state).status

export const selectTimeSummaryError = (projectId: string) => (state: RootState) =>
  selectTimeSummaryForProject(projectId)(state).error

export const selectTimeSummaryFilters = (projectId: string) => (state: RootState) =>
  selectTimeSummaryForProject(projectId)(state).filters

export const selectTimeMutationStatus = (state: RootState) => state.timeTracking.mutationStatus
export const selectTimeMutationError = (state: RootState) =>
  state.timeTracking.mutationError ?? null
export const selectLastTimeEntry = (state: RootState) => state.timeTracking.lastEntry ?? null
