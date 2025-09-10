import { createAsyncThunk } from '@reduxjs/toolkit'
import type {
  CreateTaskInput,
  UpdateTaskInput,
  MoveTaskInput,
  CreateCommentInput,
  SearchTasksInput
} from '@main/services/task.schemas'
import type { CommentDTO, TaskDetailsDTO } from '@main/services/task.types'

import {
  extractErrorMessage,
  handleResponse,
  isSessionExpiredError,
  persistToken
} from '../auth/helpers'
import { forceLogout } from '../auth/slice'
import type { RootState } from '../../types'

const ensureToken = (state: RootState): string | null => state.auth.token

const handleTaskError = (
  error: unknown,
  dispatch: (action: unknown) => unknown,
  rejectWithValue: (value: string) => unknown
) => {
  if (isSessionExpiredError(error)) {
    persistToken(null)
    dispatch(forceLogout())
    return rejectWithValue('Sessione scaduta')
  }
  return rejectWithValue(extractErrorMessage(error))
}

export const fetchTasks = createAsyncThunk<
  { projectId: string; tasks: TaskDetailsDTO[] },
  string,
  { state: RootState; rejectValue: string }
>('tasks/fetchByProject', async (projectId, { getState, dispatch, rejectWithValue }) => {
  const token = ensureToken(getState())
  if (!token) {
    return rejectWithValue('Sessione non valida')
  }
  try {
    const tasks = await handleResponse(window.api.task.list(token, projectId))
    return { projectId, tasks }
  } catch (error) {
    return handleTaskError(error, dispatch, rejectWithValue)
  }
})

export const createTask = createAsyncThunk<
  TaskDetailsDTO,
  CreateTaskInput,
  { state: RootState; rejectValue: string }
>('tasks/create', async (payload, { getState, dispatch, rejectWithValue }) => {
  const token = ensureToken(getState())
  if (!token) {
    return rejectWithValue('Sessione non valida')
  }
  try {
    return await handleResponse(window.api.task.create(token, payload))
  } catch (error) {
    return handleTaskError(error, dispatch, rejectWithValue)
  }
})

export const updateTask = createAsyncThunk<
  TaskDetailsDTO,
  { taskId: string; input: UpdateTaskInput },
  { state: RootState; rejectValue: string }
>('tasks/update', async ({ taskId, input }, { getState, dispatch, rejectWithValue }) => {
  const token = ensureToken(getState())
  if (!token) {
    return rejectWithValue('Sessione non valida')
  }
  try {
    return await handleResponse(window.api.task.update(token, taskId, input))
  } catch (error) {
    return handleTaskError(error, dispatch, rejectWithValue)
  }
})

export const moveTask = createAsyncThunk<
  TaskDetailsDTO,
  { taskId: string; input: MoveTaskInput },
  { state: RootState; rejectValue: string }
>('tasks/move', async ({ taskId, input }, { getState, dispatch, rejectWithValue }) => {
  const token = ensureToken(getState())
  if (!token) {
    return rejectWithValue('Sessione non valida')
  }
  try {
    return await handleResponse(window.api.task.move(token, taskId, input))
  } catch (error) {
    return handleTaskError(error, dispatch, rejectWithValue)
  }
})

export const deleteTask = createAsyncThunk<
  { projectId: string; taskId: string },
  { projectId: string; taskId: string },
  { state: RootState; rejectValue: string }
>('tasks/delete', async ({ projectId, taskId }, { getState, dispatch, rejectWithValue }) => {
  const token = ensureToken(getState())
  if (!token) {
    return rejectWithValue('Sessione non valida')
  }
  try {
    await handleResponse(window.api.task.remove(token, taskId))
    return { projectId, taskId }
  } catch (error) {
    return handleTaskError(error, dispatch, rejectWithValue)
  }
})

export const fetchComments = createAsyncThunk<
  { taskId: string; comments: CommentDTO[] },
  string,
  { state: RootState; rejectValue: string }
>('tasks/fetchComments', async (taskId, { getState, dispatch, rejectWithValue }) => {
  const token = ensureToken(getState())
  if (!token) {
    return rejectWithValue('Sessione non valida')
  }
  try {
    const comments = await handleResponse(window.api.task.listComments(token, taskId))
    return { taskId, comments }
  } catch (error) {
    return handleTaskError(error, dispatch, rejectWithValue)
  }
})

export const addComment = createAsyncThunk<
  { taskId: string; comment: CommentDTO },
  CreateCommentInput,
  { state: RootState; rejectValue: string }
>('tasks/addComment', async (payload, { getState, dispatch, rejectWithValue }) => {
  const token = ensureToken(getState())
  if (!token) {
    return rejectWithValue('Sessione non valida')
  }
  try {
    const comment = await handleResponse(window.api.task.addComment(token, payload))
    return { taskId: comment.taskId, comment }
  } catch (error) {
    return handleTaskError(error, dispatch, rejectWithValue)
  }
})

export const searchTasks = createAsyncThunk<
  { query: string; results: TaskDetailsDTO[] },
  SearchTasksInput,
  { state: RootState; rejectValue: string }
>('tasks/search', async (payload, { getState, dispatch, rejectWithValue }) => {
  const token = ensureToken(getState())
  if (!token) {
    return rejectWithValue('Sessione non valida')
  }
  try {
    const results = await handleResponse(window.api.task.search(token, payload))
    return { query: payload.query, results }
  } catch (error) {
    return handleTaskError(error, dispatch, rejectWithValue)
  }
})
