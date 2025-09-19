import { createAsyncThunk } from '@reduxjs/toolkit'

import type {
  CreateViewInput,
  UpdateViewInput,
  ListViewsInput
} from '@main/services/view/schemas'
import type { SavedViewDTO } from '@main/services/view/types'
import {
  extractErrorMessage,
  handleResponse,
  isSessionExpiredError,
  persistToken
} from '@renderer/store/slices/auth/helpers'
import { forceLogout } from '@renderer/store/slices/auth/slice'
import type { RootState } from '@renderer/store/types'

const ensureToken = (state: RootState): string | null => state.auth.token

const handleViewError = <T>(
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

export const fetchViews = createAsyncThunk<
  { projectId: string; views: SavedViewDTO[] },
  ListViewsInput,
  { state: RootState; rejectValue: string }
>('views/fetchByProject', async (payload, { getState, dispatch, rejectWithValue }) => {
  const token = ensureToken(getState())
  if (!token) {
    return rejectWithValue('Sessione non valida')
  }
  try {
    const views = await handleResponse(window.api.view.list(token, payload))
    return { projectId: payload.projectId, views }
  } catch (error) {
    return handleViewError(error, dispatch, rejectWithValue)
  }
})

export const createView = createAsyncThunk<
  SavedViewDTO,
  CreateViewInput,
  { state: RootState; rejectValue: string }
>('views/create', async (payload, { getState, dispatch, rejectWithValue }) => {
  const token = ensureToken(getState())
  if (!token) {
    return rejectWithValue('Sessione non valida')
  }
  try {
    return await handleResponse(window.api.view.create(token, payload))
  } catch (error) {
    return handleViewError(error, dispatch, rejectWithValue)
  }
})

export const updateView = createAsyncThunk<
  SavedViewDTO,
  { viewId: string; input: UpdateViewInput },
  { state: RootState; rejectValue: string }
>('views/update', async ({ viewId, input }, { getState, dispatch, rejectWithValue }) => {
  const token = ensureToken(getState())
  if (!token) {
    return rejectWithValue('Sessione non valida')
  }
  try {
    return await handleResponse(window.api.view.update(token, viewId, input))
  } catch (error) {
    return handleViewError(error, dispatch, rejectWithValue)
  }
})

export const deleteView = createAsyncThunk<
  { projectId: string; viewId: string },
  { projectId: string; viewId: string },
  { state: RootState; rejectValue: string }
>('views/delete', async ({ projectId, viewId }, { getState, dispatch, rejectWithValue }) => {
  const token = ensureToken(getState())
  if (!token) {
    return rejectWithValue('Sessione non valida')
  }
  try {
    await handleResponse(window.api.view.remove(token, viewId))
    return { projectId, viewId }
  } catch (error) {
    return handleViewError(error, dispatch, rejectWithValue)
  }
})

