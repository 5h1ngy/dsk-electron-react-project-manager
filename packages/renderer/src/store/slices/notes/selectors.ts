import { createSelector } from '@reduxjs/toolkit'

import type { RootState } from '@renderer/store/types'
import type { NoteSummary } from '@renderer/store/slices/notes/types'

const selectNotesState = (state: RootState) => state.notes

const emptyNotes: NoteSummary[] = []

const buildProjectSelector = (projectId: string) =>
  createSelector(selectNotesState, (state) => state.byProjectId[projectId])

export const selectProjectNotes = (projectId: string) =>
  createSelector(buildProjectSelector(projectId), (projectState): NoteSummary[] => {
    if (!projectState) {
      return emptyNotes
    }
    return projectState.ids
      .map((id) => projectState.entities[id])
      .filter((note): note is NoteSummary => Boolean(note))
  })

export const selectProjectNotesStatus = (projectId: string) =>
  createSelector(buildProjectSelector(projectId), (projectState) => projectState?.status ?? 'idle')

export const selectProjectNotesError = (projectId: string) =>
  createSelector(buildProjectSelector(projectId), (projectState) => projectState?.error)

export const selectProjectNotesFilters = (projectId: string) =>
  createSelector(
    buildProjectSelector(projectId),
    (projectState) => projectState?.filters ?? { notebook: null, tag: null, includePrivate: false }
  )

export const selectNoteDetailsState = (noteId: string) =>
  createSelector(selectNotesState, (state) => state.detailsById[noteId] ?? null)

export const selectNotesMutationStatus = (state: RootState) => state.notes.mutationStatus

export const selectNotesSearchState = (state: RootState) => state.notes.search
