import { createAsyncThunk } from '@reduxjs/toolkit'

import {
  extractErrorMessage,
  handleResponse,
  isSessionExpiredError,
  persistToken
} from '@renderer/store/slices/auth/helpers'
import { forceLogout } from '@renderer/store/slices/auth/slice'
import type { RootState } from '@renderer/store/types'
import type { NoteDetails, NoteSummary, NoteSearchResult } from '@renderer/store/slices/notes/types'
import type { ListNotesInput, SearchNotesInput } from '@services/services/note/schemas'

const ensureToken = (state: RootState): string | null => state.auth.token

const handleNoteError = <T>(
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

export interface FetchNotesArgs {
  projectId: string
  includePrivate?: boolean
  notebook?: string | null
  tag?: string | null
}

export interface CreateNoteArgs {
  projectId: string
  title: string
  body: string
  tags?: string[]
  notebook?: string | null
  linkedTaskIds?: string[]
  isPrivate?: boolean
}

export const fetchNotes = createAsyncThunk<
  { projectId: string; notes: NoteSummary[] },
  FetchNotesArgs,
  { state: RootState; rejectValue: string }
>('notes/fetchByProject', async (payload, { getState, dispatch, rejectWithValue }) => {
  const token = ensureToken(getState())
  if (!token) {
    return rejectWithValue('Sessione non valida')
  }
  try {
    const input: ListNotesInput = {
      projectId: payload.projectId,
      includePrivate: payload.includePrivate ?? false,
      notebook: payload.notebook ?? undefined,
      tag: payload.tag ?? undefined
    }
    const response = await handleResponse(window.api.note.list(token, input))
    return { projectId: payload.projectId, notes: response }
  } catch (error) {
    return handleNoteError(error, dispatch, rejectWithValue)
  }
})

export const fetchNoteDetails = createAsyncThunk<
  NoteDetails,
  string,
  { state: RootState; rejectValue: string }
>('notes/fetchNote', async (noteId, { getState, dispatch, rejectWithValue }) => {
  const token = ensureToken(getState())
  if (!token) {
    return rejectWithValue('Sessione non valida')
  }
  try {
    return await handleResponse(window.api.note.get(token, noteId))
  } catch (error) {
    return handleNoteError(error, dispatch, rejectWithValue)
  }
})

export const createNote = createAsyncThunk<
  NoteDetails,
  CreateNoteArgs,
  { state: RootState; rejectValue: string }
>('notes/create', async (payload, { getState, dispatch, rejectWithValue }) => {
  const token = ensureToken(getState())
  if (!token) {
    return rejectWithValue('Sessione non valida')
  }
  try {
    return await handleResponse(
      window.api.note.create(token, {
        projectId: payload.projectId,
        title: payload.title,
        body: payload.body,
        isPrivate: payload.isPrivate ?? false,
        tags: payload.tags ?? [],
        notebook: payload.notebook ?? undefined,
        linkedTaskIds: payload.linkedTaskIds ?? []
      })
    )
  } catch (error) {
    return handleNoteError(error, dispatch, rejectWithValue)
  }
})

export const updateNote = createAsyncThunk<
  NoteDetails,
  {
    noteId: string
    input: {
      title?: string
      body?: string
      isPrivate?: boolean
      tags?: string[]
      notebook?: string | null
      linkedTaskIds?: string[]
    }
  },
  { state: RootState; rejectValue: string }
>('notes/update', async ({ noteId, input }, { getState, dispatch, rejectWithValue }) => {
  const token = ensureToken(getState())
  if (!token) {
    return rejectWithValue('Sessione non valida')
  }
  try {
    return await handleResponse(
      window.api.note.update(token, noteId, {
        ...input,
        notebook: input.notebook ?? undefined
      })
    )
  } catch (error) {
    return handleNoteError(error, dispatch, rejectWithValue)
  }
})

export const deleteNote = createAsyncThunk<
  { success: boolean },
  { projectId: string; noteId: string },
  { state: RootState; rejectValue: string }
>('notes/delete', async ({ projectId, noteId }, { getState, dispatch, rejectWithValue }) => {
  const token = ensureToken(getState())
  if (!token) {
    return rejectWithValue('Sessione non valida')
  }
  try {
    void projectId
    await handleResponse(window.api.note.remove(token, noteId))
    return { success: true }
  } catch (error) {
    return handleNoteError(error, dispatch, rejectWithValue)
  }
})

export const searchNotes = createAsyncThunk<
  { query: string; results: NoteSearchResult[] },
  SearchNotesInput,
  { state: RootState; rejectValue: string }
>('notes/search', async (payload, { getState, dispatch, rejectWithValue }) => {
  const token = ensureToken(getState())
  if (!token) {
    return rejectWithValue('Sessione non valida')
  }
  try {
    const results = await handleResponse(window.api.note.search(token, payload))
    return { query: payload.query, results }
  } catch (error) {
    return handleNoteError(error, dispatch, rejectWithValue)
  }
})
