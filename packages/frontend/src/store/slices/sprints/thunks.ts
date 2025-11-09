import { createAsyncThunk } from '@reduxjs/toolkit'
import type { CreateSprintInput, UpdateSprintInput } from '@services/services/sprint/schemas'
import type { SprintDTO, SprintDetailsDTO } from '@services/services/sprint/types'

import {
  extractErrorMessage,
  handleResponse,
  isSessionExpiredError,
  persistToken
} from '@renderer/store/slices/auth/helpers'
import { forceLogout } from '@renderer/store/slices/auth/slice'
import type { RootState } from '@renderer/store/types'

const ensureToken = (state: RootState): string | null => state.auth.token

const handleSprintError = <T>(
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

export const fetchSprints = createAsyncThunk<
  { projectId: string; sprints: SprintDTO[] },
  string,
  { state: RootState; rejectValue: string }
>('sprints/fetchByProject', async (projectId, { getState, dispatch, rejectWithValue }) => {
  const token = ensureToken(getState())
  if (!token) {
    return rejectWithValue('Sessione non valida')
  }
  try {
    const sprints = await handleResponse(window.api.sprint.list(token, projectId))
    return { projectId, sprints }
  } catch (error) {
    return handleSprintError(error, dispatch, rejectWithValue)
  }
})

export const fetchSprintDetails = createAsyncThunk<
  SprintDetailsDTO,
  string,
  { state: RootState; rejectValue: string }
>('sprints/fetchDetails', async (sprintId, { getState, dispatch, rejectWithValue }) => {
  const token = ensureToken(getState())
  if (!token) {
    return rejectWithValue('Sessione non valida')
  }
  try {
    return await handleResponse(window.api.sprint.get(token, sprintId))
  } catch (error) {
    return handleSprintError(error, dispatch, rejectWithValue)
  }
})

export const createSprint = createAsyncThunk<
  SprintDTO,
  CreateSprintInput,
  { state: RootState; rejectValue: string }
>('sprints/create', async (payload, { getState, dispatch, rejectWithValue }) => {
  const token = ensureToken(getState())
  if (!token) {
    return rejectWithValue('Sessione non valida')
  }
  try {
    return await handleResponse(window.api.sprint.create(token, payload))
  } catch (error) {
    return handleSprintError(error, dispatch, rejectWithValue)
  }
})

export const updateSprint = createAsyncThunk<
  SprintDTO,
  { sprintId: string; input: UpdateSprintInput },
  { state: RootState; rejectValue: string }
>('sprints/update', async ({ sprintId, input }, { getState, dispatch, rejectWithValue }) => {
  const token = ensureToken(getState())
  if (!token) {
    return rejectWithValue('Sessione non valida')
  }
  try {
    return await handleResponse(window.api.sprint.update(token, sprintId, input))
  } catch (error) {
    return handleSprintError(error, dispatch, rejectWithValue)
  }
})

export const deleteSprint = createAsyncThunk<
  { projectId: string; sprintId: string },
  { projectId: string; sprintId: string },
  { state: RootState; rejectValue: string }
>('sprints/delete', async ({ projectId, sprintId }, { getState, dispatch, rejectWithValue }) => {
  const token = ensureToken(getState())
  if (!token) {
    return rejectWithValue('Sessione non valida')
  }
  try {
    await handleResponse(window.api.sprint.remove(token, sprintId))
    return { projectId, sprintId }
  } catch (error) {
    return handleSprintError(error, dispatch, rejectWithValue)
  }
})
