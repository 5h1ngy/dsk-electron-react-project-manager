import { createAsyncThunk } from '@reduxjs/toolkit'
import type {
  CreateProjectInput,
  UpdateProjectInput,
  ProjectMemberRoleInput
} from '@main/services/projectValidation'
import type { ProjectDetailsDTO, ProjectSummaryDTO } from '@main/services/projectService'

import {
  extractErrorMessage,
  handleResponse,
  isSessionExpiredError,
  persistToken
} from '../auth/helpers'
import { forceLogout } from '../auth/slice'
import type { RootState } from '../../types'

const ensureToken = (state: RootState): string | null => state.auth.token

const handleProjectError = (
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

export const fetchProjects = createAsyncThunk<
  ProjectSummaryDTO[],
  void,
  { state: RootState; rejectValue: string }
>('projects/fetchAll', async (_arg, { getState, dispatch, rejectWithValue }) => {
  const token = ensureToken(getState())
  if (!token) {
    return rejectWithValue('Sessione non valida')
  }
  try {
    return await handleResponse(window.api.project.list(token))
  } catch (error) {
    return handleProjectError(error, dispatch, rejectWithValue)
  }
})

export const fetchProjectById = createAsyncThunk<
  ProjectDetailsDTO,
  string,
  { state: RootState; rejectValue: string }
>('projects/fetchById', async (projectId, { getState, dispatch, rejectWithValue }) => {
  const token = ensureToken(getState())
  if (!token) {
    return rejectWithValue('Sessione non valida')
  }
  try {
    return await handleResponse(window.api.project.get(token, projectId))
  } catch (error) {
    return handleProjectError(error, dispatch, rejectWithValue)
  }
})

export const createProject = createAsyncThunk<
  ProjectDetailsDTO,
  CreateProjectInput,
  { state: RootState; rejectValue: string }
>('projects/create', async (payload, { getState, dispatch, rejectWithValue }) => {
  const token = ensureToken(getState())
  if (!token) {
    return rejectWithValue('Sessione non valida')
  }
  try {
    return await handleResponse(window.api.project.create(token, payload))
  } catch (error) {
    return handleProjectError(error, dispatch, rejectWithValue)
  }
})

export const updateProject = createAsyncThunk<
  ProjectDetailsDTO,
  { projectId: string; input: UpdateProjectInput },
  { state: RootState; rejectValue: string }
>('projects/update', async ({ projectId, input }, { getState, dispatch, rejectWithValue }) => {
  const token = ensureToken(getState())
  if (!token) {
    return rejectWithValue('Sessione non valida')
  }
  try {
    return await handleResponse(window.api.project.update(token, projectId, input))
  } catch (error) {
    return handleProjectError(error, dispatch, rejectWithValue)
  }
})

export const deleteProject = createAsyncThunk<
  string,
  string,
  { state: RootState; rejectValue: string }
>('projects/delete', async (projectId, { getState, dispatch, rejectWithValue }) => {
  const token = ensureToken(getState())
  if (!token) {
    return rejectWithValue('Sessione non valida')
  }
  try {
    await handleResponse(window.api.project.remove(token, projectId))
    return projectId
  } catch (error) {
    return handleProjectError(error, dispatch, rejectWithValue)
  }
})

export const addProjectMember = createAsyncThunk<
  ProjectDetailsDTO,
  { projectId: string; userId: string; role: ProjectMemberRoleInput },
  { state: RootState; rejectValue: string }
>('projects/addMember', async ({ projectId, userId, role }, options) => {
  const token = ensureToken(options.getState())
  if (!token) {
    return options.rejectWithValue('Sessione non valida')
  }
  try {
    return await handleResponse(
      window.api.project.addMember(token, projectId, {
        userId,
        role
      })
    )
  } catch (error) {
    return handleProjectError(error, options.dispatch, options.rejectWithValue)
  }
})

export const removeProjectMember = createAsyncThunk<
  ProjectDetailsDTO,
  { projectId: string; userId: string },
  { state: RootState; rejectValue: string }
>('projects/removeMember', async ({ projectId, userId }, options) => {
  const token = ensureToken(options.getState())
  if (!token) {
    return options.rejectWithValue('Sessione non valida')
  }
  try {
    return await handleResponse(window.api.project.removeMember(token, projectId, userId))
  } catch (error) {
    return handleProjectError(error, options.dispatch, options.rejectWithValue)
  }
})
