import { notesReducer, clearNoteErrors } from '@renderer/store/slices/notes/slice'
import {
  createNote,
  deleteNote,
  fetchNoteDetails,
  fetchNotes,
  searchNotes,
  updateNote
} from '@renderer/store/slices/notes/thunks'
import type {
  NoteDetails,
  NoteSummary,
  NoteSearchResult
} from '@renderer/store/slices/notes/types'

describe('notes slice', () => {
  const now = new Date()

  const baseSummary: NoteSummary = {
    id: 'note-1',
    projectId: 'proj-1',
    title: 'Weekly summary',
    notebook: 'Weekly Sync',
    isPrivate: false,
    tags: ['summary', 'decision'],
    owner: {
      id: 'user-1',
      username: 'jane',
      displayName: 'Jane Doe'
    },
    createdAt: now,
    updatedAt: now,
    linkedTasks: [
      {
        id: 'task-1',
        key: 'PR1-1',
        title: 'Implementare editor'
      }
    ]
  }

  const baseDetails: NoteDetails = {
    ...baseSummary,
    body: '## Context\n\nDettagli della settimana.'
  }

  it('gestisce fetchNotes.fulfilled popolando lo stato del progetto', () => {
    const action = fetchNotes.fulfilled(
      { projectId: 'proj-1', notes: [baseSummary] },
      'request-1',
      { projectId: 'proj-1' }
    )
    const state = notesReducer(undefined, action)
    const projectState = state.byProjectId['proj-1']

    expect(projectState).toBeDefined()
    expect(projectState?.ids).toEqual(['note-1'])
    expect(projectState?.entities['note-1']?.title).toBe('Weekly summary')
  })

  it('gestisce fetchNoteDetails.fulfilled salvando il dettaglio', () => {
    const stateAfterFetch = notesReducer(
      undefined,
      fetchNoteDetails.fulfilled(baseDetails, 'request-1', baseDetails.id)
    )

    const detailState = stateAfterFetch.detailsById[baseDetails.id]
    expect(detailState?.data?.body).toContain('Dettagli')
    expect(detailState?.status).toBe('succeeded')
  })

  it('gestisce createNote.fulfilled aggiungendo nota e dettaglio', () => {
    const state = notesReducer(
      undefined,
      createNote.fulfilled(baseDetails, 'request-1', {
        projectId: baseDetails.projectId,
        title: baseDetails.title,
        body: baseDetails.body
      })
    )

    const projectState = state.byProjectId[baseDetails.projectId]
    expect(projectState?.entities[baseDetails.id]).toBeDefined()
    expect(state.detailsById[baseDetails.id]?.data?.title).toBe(baseDetails.title)
    expect(state.mutationStatus).toBe('succeeded')
  })

  it('gestisce updateNote.fulfilled aggiornando la nota esistente', () => {
    const initial = notesReducer(
      undefined,
      createNote.fulfilled(baseDetails, 'request-1', {
        projectId: baseDetails.projectId,
        title: baseDetails.title,
        body: baseDetails.body
      })
    )

    const updated: NoteDetails = {
      ...baseDetails,
      title: 'Weekly summary (updated)',
      updatedAt: new Date()
    }

    const state = notesReducer(
      initial,
      updateNote.fulfilled(updated, 'request-2', {
        noteId: updated.id,
        input: { title: updated.title }
      })
    )

    expect(state.byProjectId[updated.projectId]?.entities[updated.id]?.title).toContain(
      '(updated)'
    )
    expect(state.detailsById[updated.id]?.data?.title).toContain('(updated)')
  })

  it('gestisce deleteNote.fulfilled rimuovendo la nota', () => {
    const withNote = notesReducer(
      undefined,
      fetchNotes.fulfilled(
        { projectId: baseSummary.projectId, notes: [baseSummary] },
        'request-1',
        { projectId: baseSummary.projectId }
      )
    )

    const state = notesReducer(
      withNote,
      deleteNote.fulfilled({ success: true }, 'request-2', {
        projectId: baseSummary.projectId,
        noteId: baseSummary.id
      })
    )

    expect(state.byProjectId[baseSummary.projectId]?.ids).toHaveLength(0)
    expect(state.byProjectId[baseSummary.projectId]?.entities[baseSummary.id]).toBeUndefined()
  })

  it('gestisce searchNotes.fulfilled popolando i risultati', () => {
    const result: NoteSearchResult = {
      ...baseSummary,
      highlight: '<mark>summary</mark>'
    }
    const state = notesReducer(
      undefined,
      searchNotes.fulfilled({ query: 'summary', results: [result] }, 'request-1', {
        query: 'summary'
      })
    )

    expect(state.search.status).toBe('succeeded')
    expect(state.search.results[0].highlight).toContain('<mark>')
  })

  it('pulisce gli errori tramite clearNoteErrors', () => {
    const errorState = notesReducer(
      undefined,
      fetchNotes.rejected(new Error('Errore'), 'request-1', { projectId: 'proj-1' }, 'Errore')
    )
    const cleaned = notesReducer(errorState, clearNoteErrors(undefined))

    expect(cleaned.byProjectId['proj-1']?.error).toBeUndefined()
  })
})
