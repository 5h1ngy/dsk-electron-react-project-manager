import type { RootState } from '@renderer/store/types'
import type {
  ProjectWikiState,
  WikiPageDetails,
  WikiPageSummary,
  WikiRevisionsState
} from '@renderer/store/slices/wiki/types'

const defaultProjectState: ProjectWikiState = {
  pages: [],
  status: 'idle',
  error: undefined,
  pageDetails: {},
  pageStatus: {},
  pageErrors: {},
  revisions: {}
}

export const selectWikiProjectState =
  (projectId: string) =>
  (state: RootState): ProjectWikiState =>
    state.wiki.byProject[projectId] ?? defaultProjectState

export const selectWikiPages =
  (projectId: string) =>
  (state: RootState): WikiPageSummary[] =>
    selectWikiProjectState(projectId)(state).pages

export const selectWikiStatus = (projectId: string) => (state: RootState) =>
  selectWikiProjectState(projectId)(state).status

export const selectWikiPageDetails =
  (projectId: string, pageId: string) =>
  (state: RootState): WikiPageDetails | undefined =>
    selectWikiProjectState(projectId)(state).pageDetails[pageId]

export const selectWikiPageStatus = (projectId: string, pageId: string) => (state: RootState) =>
  selectWikiProjectState(projectId)(state).pageStatus[pageId] ?? 'idle'

export const selectWikiPageError = (projectId: string, pageId: string) => (state: RootState) =>
  selectWikiProjectState(projectId)(state).pageErrors[pageId]

export const selectWikiRevisions =
  (projectId: string, pageId: string) =>
  (state: RootState): WikiRevisionsState =>
    selectWikiProjectState(projectId)(state).revisions[pageId] ?? {
      items: [],
      status: 'idle',
      error: undefined
    }
