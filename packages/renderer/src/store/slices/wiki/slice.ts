import { createSlice } from '@reduxjs/toolkit'

import type { ProjectWikiState, WikiPageDetails, WikiPageSummary, WikiState } from '@renderer/store/slices/wiki/types'
import {
  createWikiPage,
  deleteWikiPage,
  fetchWikiPage,
  fetchWikiPages,
  fetchWikiRevisions,
  restoreWikiRevision,
  updateWikiPage
} from '@renderer/store/slices/wiki/thunks'

const buildProjectState = (): ProjectWikiState => ({
  pages: [],
  status: 'idle',
  error: undefined,
  pageDetails: {},
  pageStatus: {},
  pageErrors: {},
  revisions: {}
})

const initialState: WikiState = {
  byProject: {}
}

const ensureProjectState = (state: WikiState, projectId: string): ProjectWikiState => {
  if (!state.byProject[projectId]) {
    state.byProject[projectId] = buildProjectState()
  }
  return state.byProject[projectId]
}

const toSummary = (page: WikiPageDetails | WikiPageSummary): WikiPageSummary => ({
  id: page.id,
  projectId: page.projectId,
  title: page.title,
  slug: page.slug,
  summary: page.summary ?? null,
  displayOrder: page.displayOrder,
  updatedAt: page.updatedAt,
  updatedBy: page.updatedBy
})

const upsertSummary = (project: ProjectWikiState, summary: WikiPageSummary) => {
  const existingIndex = project.pages.findIndex((page) => page.id === summary.id)
  if (existingIndex >= 0) {
    project.pages[existingIndex] = summary
  } else {
    project.pages.push(summary)
  }
  project.pages.sort((a, b) => {
    if (a.displayOrder !== b.displayOrder) {
      return a.displayOrder - b.displayOrder
    }
    return a.title.localeCompare(b.title)
  })
}

const wikiSlice = createSlice({
  name: 'wiki',
  initialState,
  reducers: {
    resetProject(state, action) {
      delete state.byProject[action.payload as string]
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWikiPages.pending, (state, action) => {
        const project = ensureProjectState(state, action.meta.arg)
        project.status = 'loading'
        project.error = undefined
      })
      .addCase(fetchWikiPages.fulfilled, (state, action) => {
        const project = ensureProjectState(state, action.payload.projectId)
        project.status = 'succeeded'
        project.error = undefined
        project.pages = action.payload.pages
      })
      .addCase(fetchWikiPages.rejected, (state, action) => {
        const projectId = action.meta.arg
        const project = ensureProjectState(state, projectId)
        project.status = 'failed'
        project.error = action.payload ?? action.error.message ?? 'Impossibile caricare la wiki'
      })
      .addCase(fetchWikiPage.pending, (state, action) => {
        const { projectId, pageId } = action.meta.arg
        const project = ensureProjectState(state, projectId)
        project.pageStatus[pageId] = 'loading'
        project.pageErrors[pageId] = undefined
      })
      .addCase(fetchWikiPage.fulfilled, (state, action) => {
        const { projectId, page } = action.payload
        const project = ensureProjectState(state, projectId)
        project.pageStatus[page.id] = 'succeeded'
        project.pageErrors[page.id] = undefined
        project.pageDetails[page.id] = page
        upsertSummary(project, toSummary(page))
      })
      .addCase(fetchWikiPage.rejected, (state, action) => {
        const { projectId, pageId } = action.meta.arg
        const project = ensureProjectState(state, projectId)
        project.pageStatus[pageId] = 'failed'
        project.pageErrors[pageId] = action.payload ?? action.error.message ?? 'Impossibile caricare la pagina'
      })
      .addCase(createWikiPage.fulfilled, (state, action) => {
        const { projectId, page } = action.payload
        const project = ensureProjectState(state, projectId)
        project.pageDetails[page.id] = page
        project.pageStatus[page.id] = 'succeeded'
        upsertSummary(project, toSummary(page))
      })
      .addCase(updateWikiPage.fulfilled, (state, action) => {
        const { projectId, page } = action.payload
        const project = ensureProjectState(state, projectId)
        project.pageDetails[page.id] = page
        project.pageStatus[page.id] = 'succeeded'
        upsertSummary(project, toSummary(page))
      })
      .addCase(updateWikiPage.rejected, (state, action) => {
        const { projectId, pageId } = action.meta.arg
        const project = ensureProjectState(state, projectId)
        project.pageStatus[pageId] = 'failed'
        project.pageErrors[pageId] = action.payload ?? action.error.message ?? 'Aggiornamento non riuscito'
      })
      .addCase(deleteWikiPage.fulfilled, (state, action) => {
        const { projectId, pageId } = action.payload
        const project = ensureProjectState(state, projectId)
        project.pages = project.pages.filter((page) => page.id !== pageId)
        delete project.pageDetails[pageId]
        delete project.pageStatus[pageId]
        delete project.pageErrors[pageId]
        delete project.revisions[pageId]
      })
      .addCase(deleteWikiPage.rejected, (state, action) => {
        const { projectId, pageId } = action.meta.arg
        const project = ensureProjectState(state, projectId)
        project.pageErrors[pageId] = action.payload ?? action.error.message ?? 'Eliminazione non riuscita'
      })
      .addCase(fetchWikiRevisions.pending, (state, action) => {
        const { projectId, pageId } = action.meta.arg
        const project = ensureProjectState(state, projectId)
        if (!project.revisions[pageId]) {
          project.revisions[pageId] = { items: [], status: 'idle', error: undefined }
        }
        project.revisions[pageId].status = 'loading'
        project.revisions[pageId].error = undefined
      })
      .addCase(fetchWikiRevisions.fulfilled, (state, action) => {
        const { projectId, pageId, revisions } = action.payload
        const project = ensureProjectState(state, projectId)
        project.revisions[pageId] = {
          items: revisions,
          status: 'succeeded',
          error: undefined
        }
      })
      .addCase(fetchWikiRevisions.rejected, (state, action) => {
        const { projectId, pageId } = action.meta.arg
        const project = ensureProjectState(state, projectId)
        if (!project.revisions[pageId]) {
          project.revisions[pageId] = { items: [], status: 'idle', error: undefined }
        }
        project.revisions[pageId].status = 'failed'
        project.revisions[pageId].error = action.payload ?? action.error.message ?? 'Caricamento revisioni non riuscito'
      })
      .addCase(restoreWikiRevision.fulfilled, (state, action) => {
        const { projectId, page } = action.payload
        const project = ensureProjectState(state, projectId)
        project.pageDetails[page.id] = page
        project.pageStatus[page.id] = 'succeeded'
        upsertSummary(project, toSummary(page))
      })
      .addCase(restoreWikiRevision.rejected, (state, action) => {
        const { projectId, pageId } = action.meta.arg
        const project = ensureProjectState(state, projectId)
        project.pageErrors[pageId] = action.payload ?? action.error.message ?? 'Ripristino non riuscito'
      })
  }
})

export const { resetProject } = wikiSlice.actions
export const wikiReducer = wikiSlice.reducer
