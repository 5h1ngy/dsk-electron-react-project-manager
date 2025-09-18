import { createSlice } from '@reduxjs/toolkit'

import type {
  NoteDetailsState,
  NotesState,
  ProjectNotesState
} from '@renderer/store/slices/notes/types'
import {
  createNote,
  deleteNote,
  fetchNoteDetails,
  fetchNotes,
  searchNotes,
  updateNote
} from '@renderer/store/slices/notes/thunks'

const buildProjectState = (): ProjectNotesState => ({
  ids: [],
  entities: {},
  status: 'idle',
  error: undefined,
  filters: {
    notebook: null,
    tag: null,
    includePrivate: false
  }
})

const buildDetailsState = (): NoteDetailsState => ({
  data: null,
  status: 'idle',
  error: undefined
})

const initialState: NotesState = {
  byProjectId: {},
  detailsById: {},
  search: {
    query: '',
    results: [],
    status: 'idle',
    error: undefined
  },
  mutationStatus: 'idle'
}

const ensureProjectState = (state: NotesState, projectId: string): ProjectNotesState => {
  if (!state.byProjectId[projectId]) {
    state.byProjectId[projectId] = buildProjectState()
  }
  return state.byProjectId[projectId]
}

const ensureDetailState = (state: NotesState, noteId: string): NoteDetailsState => {
  if (!state.detailsById[noteId]) {
    state.detailsById[noteId] = buildDetailsState()
  }
  return state.detailsById[noteId]
}

const notesSlice = createSlice({
  name: 'notes',
  initialState,
  reducers: {
    setProjectNoteFilters: (
      state,
      action: {
        payload: { projectId: string; filters: Partial<ProjectNotesState['filters']> }
      }
    ) => {
      const { projectId, filters } = action.payload
      const projectState = ensureProjectState(state, projectId)
      projectState.filters = { ...projectState.filters, ...filters }
    },
    clearNoteErrors: (state, action) => {
      if (action.payload) {
        const projectState = state.byProjectId[action.payload as string]
        if (projectState) {
          projectState.error = undefined
        }
      } else {
        Object.values(state.byProjectId).forEach((projectState) => {
          projectState.error = undefined
        })
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotes.pending, (state, action) => {
        const { projectId } = action.meta.arg
        const projectState = ensureProjectState(state, projectId)
        projectState.status = 'loading'
        projectState.error = undefined
        projectState.filters = {
          notebook: action.meta.arg.notebook ?? null,
          tag: action.meta.arg.tag ?? null,
          includePrivate: action.meta.arg.includePrivate ?? false
        }
      })
      .addCase(fetchNotes.fulfilled, (state, action) => {
        const { projectId, notes } = action.payload
        const projectState = ensureProjectState(state, projectId)
        projectState.status = 'succeeded'
        projectState.ids = notes.map((note) => note.id)
        projectState.entities = notes.reduce<Record<string, typeof notes[number]>>(
          (accumulator, note) => {
            accumulator[note.id] = note
            return accumulator
          },
          {}
        )
        projectState.error = undefined
      })
      .addCase(fetchNotes.rejected, (state, action) => {
        const { projectId } = action.meta.arg
        const projectState = ensureProjectState(state, projectId)
        projectState.status = 'failed'
        projectState.error = action.payload ?? 'Operazione non riuscita'
      })
      .addCase(fetchNoteDetails.pending, (state, action) => {
        const detailState = ensureDetailState(state, action.meta.arg)
        detailState.status = 'loading'
        detailState.error = undefined
      })
      .addCase(fetchNoteDetails.fulfilled, (state, action) => {
        const detailState = ensureDetailState(state, action.payload.id)
        detailState.status = 'succeeded'
        detailState.data = action.payload
      })
      .addCase(fetchNoteDetails.rejected, (state, action) => {
        const detailState = ensureDetailState(state, action.meta.arg)
        detailState.status = 'failed'
        detailState.error = action.payload ?? 'Operazione non riuscita'
      })
      .addCase(createNote.pending, (state) => {
        state.mutationStatus = 'loading'
      })
      .addCase(createNote.fulfilled, (state, action) => {
        state.mutationStatus = 'succeeded'
        const note = action.payload
        const projectState = ensureProjectState(state, note.projectId)
        projectState.entities[note.id] = note
        if (!projectState.ids.includes(note.id)) {
          projectState.ids.unshift(note.id)
        }
        const detailState = ensureDetailState(state, note.id)
        detailState.data = note
        detailState.status = 'succeeded'
      })
      .addCase(createNote.rejected, (state, action) => {
        state.mutationStatus = 'failed'
        if (action.meta.arg.projectId) {
          const projectState = ensureProjectState(state, action.meta.arg.projectId)
          projectState.error = action.payload ?? 'Operazione non riuscita'
        }
      })
      .addCase(updateNote.pending, (state) => {
        state.mutationStatus = 'loading'
      })
      .addCase(updateNote.fulfilled, (state, action) => {
        state.mutationStatus = 'succeeded'
        const note = action.payload
        const projectState = ensureProjectState(state, note.projectId)
        projectState.entities[note.id] = note
        if (!projectState.ids.includes(note.id)) {
          projectState.ids.unshift(note.id)
        }
        const detailState = ensureDetailState(state, note.id)
        detailState.data = note
        detailState.status = 'succeeded'
      })
      .addCase(updateNote.rejected, (state, action) => {
        state.mutationStatus = 'failed'
        const detailState = state.detailsById[action.meta.arg.noteId]
        if (detailState) {
          detailState.error = action.payload ?? 'Operazione non riuscita'
        }
      })
      .addCase(deleteNote.pending, (state) => {
        state.mutationStatus = 'loading'
      })
      .addCase(deleteNote.fulfilled, (state, action) => {
        state.mutationStatus = 'succeeded'
        const { noteId, projectId } = action.meta.arg
        const projectState = ensureProjectState(state, projectId)
        projectState.ids = projectState.ids.filter((id) => id !== noteId)
        delete projectState.entities[noteId]
        delete state.detailsById[noteId]
      })
      .addCase(deleteNote.rejected, (state, action) => {
        state.mutationStatus = 'failed'
        const projectState = ensureProjectState(state, action.meta.arg.projectId)
        projectState.error = action.payload ?? 'Operazione non riuscita'
      })
      .addCase(searchNotes.pending, (state, action) => {
        state.search.status = 'loading'
        state.search.query = action.meta.arg.query
        state.search.error = undefined
      })
      .addCase(searchNotes.fulfilled, (state, action) => {
        state.search.status = 'succeeded'
        state.search.results = action.payload.results
        state.search.query = action.payload.query
      })
      .addCase(searchNotes.rejected, (state, action) => {
        state.search.status = 'failed'
        state.search.error = action.payload ?? 'Operazione non riuscita'
      })
  }
})

export const notesReducer = notesSlice.reducer
export const { setProjectNoteFilters, clearNoteErrors } = notesSlice.actions
