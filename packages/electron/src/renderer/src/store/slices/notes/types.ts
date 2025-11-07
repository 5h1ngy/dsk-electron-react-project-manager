import type {
  NoteDetailsDTO,
  NoteSummaryDTO,
  NoteSearchResultDTO
} from '@services/services/note/types'

export type NoteSummary = NoteSummaryDTO
export type NoteDetails = NoteDetailsDTO
export type NoteSearchResult = NoteSearchResultDTO

export type LoadStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

export interface ProjectNotesState {
  ids: string[]
  entities: Record<string, NoteSummary>
  status: LoadStatus
  error?: string
  filters: {
    notebook: string | null
    tag: string | null
    includePrivate: boolean
  }
}

export interface NoteDetailsState {
  data: NoteDetails | null
  status: LoadStatus
  error?: string
}

export interface NoteSearchState {
  query: string
  results: NoteSearchResult[]
  status: LoadStatus
  error?: string
}

export interface NotesState {
  byProjectId: Record<string, ProjectNotesState>
  detailsById: Record<string, NoteDetailsState>
  search: NoteSearchState
  mutationStatus: LoadStatus
}
