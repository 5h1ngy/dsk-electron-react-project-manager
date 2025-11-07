import { createAsyncThunk } from '@reduxjs/toolkit'
import type {
  ListTaskStatusesInput,
  CreateTaskStatusInput,
  UpdateTaskStatusInput,
  ReorderTaskStatusesInput,
  DeleteTaskStatusInput
} from '@services/services/taskStatus/schemas'
import type { TaskStatusDTO } from '@services/services/taskStatus/types'

import {
  extractErrorMessage,
  handleResponse,
  isSessionExpiredError,
  persistToken
} from '@renderer/store/slices/auth/helpers'
import { forceLogout } from '@renderer/store/slices/auth/slice'
import type { RootState } from '@renderer/store/types'

const ensureToken = (state: RootState): string | null => state.auth.token

const handleTaskStatusError = <T>(
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

export const fetchTaskStatuses = createAsyncThunk<
  { projectId: string; statuses: TaskStatusDTO[] },
  ListTaskStatusesInput['projectId'],
  { state: RootState; rejectValue: string }
>('taskStatuses/fetch', async (projectId, { getState, dispatch, rejectWithValue }) => {
  const token = ensureToken(getState())
  if (!token) {
    return rejectWithValue('Sessione non valida')
  }
  try {
    const statuses = await handleResponse(
      window.api.taskStatus.list(token, { projectId } as ListTaskStatusesInput)
    )
    return { projectId, statuses }
  } catch (error) {
    return handleTaskStatusError(error, dispatch, rejectWithValue)
  }
})

export const createTaskStatus = createAsyncThunk<
  TaskStatusDTO,
  CreateTaskStatusInput,
  { state: RootState; rejectValue: string }
>('taskStatuses/create', async (payload, { getState, dispatch, rejectWithValue }) => {
  const token = ensureToken(getState())
  if (!token) {
    return rejectWithValue('Sessione non valida')
  }
  try {
    return await handleResponse(window.api.taskStatus.create(token, payload))
  } catch (error) {
    return handleTaskStatusError(error, dispatch, rejectWithValue)
  }
})

export const updateTaskStatus = createAsyncThunk<
  TaskStatusDTO,
  { statusId: string; payload: UpdateTaskStatusInput },
  { state: RootState; rejectValue: string }
>('taskStatuses/update', async ({ statusId, payload }, { getState, dispatch, rejectWithValue }) => {
  const token = ensureToken(getState())
  if (!token) {
    return rejectWithValue('Sessione non valida')
  }
  try {
    return await handleResponse(window.api.taskStatus.update(token, statusId, payload))
  } catch (error) {
    return handleTaskStatusError(error, dispatch, rejectWithValue)
  }
})

export const reorderTaskStatuses = createAsyncThunk<
  { projectId: string; statuses: TaskStatusDTO[] },
  ReorderTaskStatusesInput,
  { state: RootState; rejectValue: string }
>('taskStatuses/reorder', async (payload, { getState, dispatch, rejectWithValue }) => {
  const token = ensureToken(getState())
  if (!token) {
    return rejectWithValue('Sessione non valida')
  }
  try {
    const statuses = await handleResponse(window.api.taskStatus.reorder(token, payload))
    return { projectId: payload.projectId, statuses }
  } catch (error) {
    return handleTaskStatusError(error, dispatch, rejectWithValue)
  }
})

export const deleteTaskStatus = createAsyncThunk<
  { projectId: string; statusId: string },
  DeleteTaskStatusInput & { projectId: string },
  { state: RootState; rejectValue: string }
>('taskStatuses/delete', async (payload, { getState, dispatch, rejectWithValue }) => {
  const token = ensureToken(getState())
  if (!token) {
    return rejectWithValue('Sessione non valida')
  }
  try {
    const { projectId, statusId, fallbackStatusId } = payload
    await handleResponse(
      window.api.taskStatus.remove(token, {
        statusId,
        fallbackStatusId
      } satisfies DeleteTaskStatusInput)
    )
    return { projectId, statusId }
  } catch (error) {
    return handleTaskStatusError(error, dispatch, rejectWithValue)
  }
})
