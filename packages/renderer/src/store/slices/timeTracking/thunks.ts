import { createAsyncThunk } from '@reduxjs/toolkit'
import type {
  CreateTimeEntryInput,
  UpdateTimeEntryInput,
  ProjectTimeSummaryInput
} from '@main/services/timeTracking/schemas'
import type { ProjectTimeSummaryDTO, TimeEntryDTO } from '@main/services/timeTracking/types'

import {
  extractErrorMessage,
  handleResponse,
  isSessionExpiredError,
  persistToken
} from '@renderer/store/slices/auth/helpers'
import { forceLogout } from '@renderer/store/slices/auth/slice'
import type { RootState } from '@renderer/store/types'

const ensureToken = (state: RootState): string | null => state.auth.token

const handleTimeError = <T>(
  error: unknown,
  dispatch: (action: unknown) => unknown,
  rejectWithValue: (value: string) => T
): T => {
  if (isSessionExpiredError(error)) {
    persistToken(null)
    dispatch(forceLogout())
    return rejectWithValue('Sessione scaduta')
  }
  return rejectWithValue(extractErrorMessage(error))
}

const resolveSummaryFilters = (
  state: RootState,
  projectId: string,
  overrides?: Partial<Omit<ProjectTimeSummaryInput, 'projectId'>>
): ProjectTimeSummaryInput => {
  const existing = state.timeTracking.byProjectId[projectId]?.filters ?? null
  return {
    projectId,
    from: overrides?.from ?? existing?.from ?? null,
    to: overrides?.to ?? existing?.to ?? null,
    userIds: overrides?.userIds ?? existing?.userIds,
    taskIds: overrides?.taskIds ?? existing?.taskIds
  }
}

export const fetchProjectTimeSummary = createAsyncThunk<
  { projectId: string; summary: ProjectTimeSummaryDTO; filters: ProjectTimeSummaryInput },
  { projectId: string; filters?: Partial<Omit<ProjectTimeSummaryInput, 'projectId'>> },
  { state: RootState; rejectValue: string }
>(
  'timeTracking/fetchSummary',
  async ({ projectId, filters }, { getState, dispatch, rejectWithValue }) => {
    const token = ensureToken(getState())
    if (!token) {
      return rejectWithValue('Sessione non valida')
    }
    try {
      const request = resolveSummaryFilters(getState(), projectId, filters)
      const summary = await handleResponse(window.api.timeTracking.summary(token, request))
      return { projectId, summary, filters: request }
    } catch (error) {
      return handleTimeError(error, dispatch, rejectWithValue)
    }
  }
)

export const logTimeEntry = createAsyncThunk<
  TimeEntryDTO,
  CreateTimeEntryInput,
  { state: RootState; rejectValue: string }
>('timeTracking/logEntry', async (payload, { getState, dispatch, rejectWithValue }) => {
  const token = ensureToken(getState())
  if (!token) {
    return rejectWithValue('Sessione non valida')
  }
  try {
    const entry = await handleResponse(window.api.timeTracking.log(token, payload))
    void dispatch(fetchProjectTimeSummary({ projectId: entry.projectId }))
    return entry
  } catch (error) {
    return handleTimeError(error, dispatch, rejectWithValue)
  }
})

export const updateTimeEntry = createAsyncThunk<
  TimeEntryDTO,
  { entryId: string; input: UpdateTimeEntryInput },
  { state: RootState; rejectValue: string }
>(
  'timeTracking/updateEntry',
  async ({ entryId, input }, { getState, dispatch, rejectWithValue }) => {
    const token = ensureToken(getState())
    if (!token) {
      return rejectWithValue('Sessione non valida')
    }
    try {
      const entry = await handleResponse(window.api.timeTracking.update(token, entryId, input))
      void dispatch(fetchProjectTimeSummary({ projectId: entry.projectId }))
      return entry
    } catch (error) {
      return handleTimeError(error, dispatch, rejectWithValue)
    }
  }
)

export const deleteTimeEntry = createAsyncThunk<
  { projectId: string; entryId: string },
  { projectId: string; entryId: string },
  { state: RootState; rejectValue: string }
>(
  'timeTracking/deleteEntry',
  async ({ projectId, entryId }, { getState, dispatch, rejectWithValue }) => {
    const token = ensureToken(getState())
    if (!token) {
      return rejectWithValue('Sessione non valida')
    }
    try {
      await handleResponse(window.api.timeTracking.remove(token, entryId))
      void dispatch(fetchProjectTimeSummary({ projectId }))
      return { projectId, entryId }
    } catch (error) {
      return handleTimeError(error, dispatch, rejectWithValue)
    }
  }
)
