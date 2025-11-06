import { createAsyncThunk } from '@reduxjs/toolkit'

import {
  extractErrorMessage,
  handleResponse,
  isSessionExpiredError,
  persistToken
} from '@renderer/store/slices/auth/helpers'
import { forceLogout } from '@renderer/store/slices/auth/slice'
import type { RootState } from '@renderer/store/types'
import type {
  WikiPageDetails,
  WikiPageSummary,
  WikiRevision
} from '@renderer/store/slices/wiki/types'
import type {
  WikiPageDetailsDTO,
  WikiPageSummaryDTO,
  WikiRevisionDTO
} from '@main/services/wiki/types'

const ensureToken = (state: RootState): string | null => state.auth.token

const handleWikiError = <T>(
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

const toUserRef = (user: WikiPageSummaryDTO['updatedBy']): WikiPageSummary['updatedBy'] => ({
  id: user.id,
  username: user.username,
  displayName: user.displayName ?? null
})

const toSummary = (dto: WikiPageSummaryDTO): WikiPageSummary => ({
  id: dto.id,
  projectId: dto.projectId,
  title: dto.title,
  slug: dto.slug,
  summary: dto.summary ?? null,
  displayOrder: dto.displayOrder,
  updatedAt: dto.updatedAt,
  updatedBy: toUserRef(dto.updatedBy)
})

const toDetails = (dto: WikiPageDetailsDTO): WikiPageDetails => ({
  ...toSummary(dto),
  content: dto.content,
  createdAt: dto.createdAt,
  createdBy: toUserRef(dto.createdBy)
})

const toRevision = (dto: WikiRevisionDTO): WikiRevision => ({
  id: dto.id,
  pageId: dto.pageId,
  title: dto.title,
  summary: dto.summary ?? null,
  createdAt: dto.createdAt,
  createdBy: toUserRef(dto.createdBy)
})

export const fetchWikiPages = createAsyncThunk<
  { projectId: string; pages: WikiPageSummary[] },
  string,
  { state: RootState; rejectValue: string }
>('wiki/fetchPages', async (projectId, { getState, dispatch, rejectWithValue }) => {
  const token = ensureToken(getState())
  if (!token) {
    return rejectWithValue('Sessione non valida')
  }
  try {
    const pages = await handleResponse(window.api.wiki.list(token, projectId))
    return { projectId, pages: pages.map(toSummary) }
  } catch (error) {
    return handleWikiError(error, dispatch, rejectWithValue)
  }
})

export const fetchWikiPage = createAsyncThunk<
  { projectId: string; page: WikiPageDetails },
  { projectId: string; pageId: string },
  { state: RootState; rejectValue: string }
>('wiki/fetchPage', async ({ projectId, pageId }, { getState, dispatch, rejectWithValue }) => {
  const token = ensureToken(getState())
  if (!token) {
    return rejectWithValue('Sessione non valida')
  }
  try {
    const page = await handleResponse(window.api.wiki.get(token, projectId, pageId))
    return { projectId, page: toDetails(page) }
  } catch (error) {
    return handleWikiError(error, dispatch, rejectWithValue)
  }
})

export interface CreateWikiPageArgs {
  projectId: string
  title: string
  content: string
  summary?: string | null
}

export const createWikiPage = createAsyncThunk<
  { projectId: string; page: WikiPageDetails },
  CreateWikiPageArgs,
  { state: RootState; rejectValue: string }
>('wiki/createPage', async (payload, { getState, dispatch, rejectWithValue }) => {
  const token = ensureToken(getState())
  if (!token) {
    return rejectWithValue('Sessione non valida')
  }
  try {
    const page = await handleResponse(
      window.api.wiki.create(token, payload.projectId, {
        title: payload.title,
        content: payload.content,
        summary: payload.summary ?? null
      })
    )
    return { projectId: payload.projectId, page: toDetails(page) }
  } catch (error) {
    return handleWikiError(error, dispatch, rejectWithValue)
  }
})

export interface UpdateWikiPageArgs {
  projectId: string
  pageId: string
  title: string
  content: string
  summary?: string | null
}

export const updateWikiPage = createAsyncThunk<
  { projectId: string; page: WikiPageDetails },
  UpdateWikiPageArgs,
  { state: RootState; rejectValue: string }
>('wiki/updatePage', async (payload, { getState, dispatch, rejectWithValue }) => {
  const token = ensureToken(getState())
  if (!token) {
    return rejectWithValue('Sessione non valida')
  }
  try {
    const page = await handleResponse(
      window.api.wiki.update(token, payload.projectId, payload.pageId, {
        title: payload.title,
        content: payload.content,
        summary: payload.summary ?? null
      })
    )
    return { projectId: payload.projectId, page: toDetails(page) }
  } catch (error) {
    return handleWikiError(error, dispatch, rejectWithValue)
  }
})

export const deleteWikiPage = createAsyncThunk<
  { projectId: string; pageId: string },
  { projectId: string; pageId: string },
  { state: RootState; rejectValue: string }
>('wiki/deletePage', async ({ projectId, pageId }, { getState, dispatch, rejectWithValue }) => {
  const token = ensureToken(getState())
  if (!token) {
    return rejectWithValue('Sessione non valida')
  }
  try {
    await handleResponse(window.api.wiki.remove(token, projectId, pageId))
    return { projectId, pageId }
  } catch (error) {
    return handleWikiError(error, dispatch, rejectWithValue)
  }
})

export const fetchWikiRevisions = createAsyncThunk<
  { projectId: string; pageId: string; revisions: WikiRevision[] },
  { projectId: string; pageId: string },
  { state: RootState; rejectValue: string }
>('wiki/fetchRevisions', async ({ projectId, pageId }, { getState, dispatch, rejectWithValue }) => {
  const token = ensureToken(getState())
  if (!token) {
    return rejectWithValue('Sessione non valida')
  }
  try {
    const revisions = await handleResponse(window.api.wiki.revisions(token, projectId, pageId))
    return { projectId, pageId, revisions: revisions.map(toRevision) }
  } catch (error) {
    return handleWikiError(error, dispatch, rejectWithValue)
  }
})

export const restoreWikiRevision = createAsyncThunk<
  { projectId: string; page: WikiPageDetails },
  { projectId: string; pageId: string; revisionId: string },
  { state: RootState; rejectValue: string }
>(
  'wiki/restoreRevision',
  async ({ projectId, pageId, revisionId }, { getState, dispatch, rejectWithValue }) => {
    const token = ensureToken(getState())
    if (!token) {
      return rejectWithValue('Sessione non valida')
    }
    try {
      const page = await handleResponse(
        window.api.wiki.restore(token, projectId, pageId, revisionId)
      )
      return { projectId, page: toDetails(page) }
    } catch (error) {
      return handleWikiError(error, dispatch, rejectWithValue)
    }
  }
)
