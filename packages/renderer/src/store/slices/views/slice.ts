import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import {
  fetchViews,
  createView,
  updateView,
  deleteView
} from '@renderer/store/slices/views/thunks'
import type { ViewsState, ProjectViewsState } from '@renderer/store/slices/views/types'

const ensureProjectState = (
  state: ViewsState,
  projectId: string
): ProjectViewsState => {
  if (!state.byProjectId[projectId]) {
    state.byProjectId[projectId] = {
      items: [],
      status: 'idle',
      error: undefined,
      selectedId: null
    }
  }
  return state.byProjectId[projectId]
}

const initialState: ViewsState = {
  byProjectId: {},
  mutationStatus: 'idle',
  error: undefined
}

const viewsSlice = createSlice({
  name: 'views',
  initialState,
  reducers: {
    selectSavedView: (
      state,
      action: PayloadAction<{ projectId: string; viewId: string | null }>
    ) => {
      const project = ensureProjectState(state, action.payload.projectId)
      project.selectedId = action.payload.viewId
    },
    clearViewsError: (
      state,
      action: PayloadAction<{ projectId?: string } | undefined>
    ) => {
      if (action?.payload?.projectId) {
        const project = state.byProjectId[action.payload.projectId]
        if (project) {
          project.error = undefined
        }
      }
      state.error = undefined
      state.mutationStatus = 'idle'
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchViews.pending, (state, action) => {
        const project = ensureProjectState(state, action.meta.arg.projectId)
        project.status = 'loading'
        project.error = undefined
      })
      .addCase(fetchViews.fulfilled, (state, action) => {
        const { projectId, views } = action.payload
        const project = ensureProjectState(state, projectId)
        project.status = 'succeeded'
        project.error = undefined
        project.items = views
        if (project.selectedId && !views.some((view) => view.id === project.selectedId)) {
          project.selectedId = null
        }
      })
      .addCase(fetchViews.rejected, (state, action) => {
        const project = ensureProjectState(state, action.meta.arg.projectId)
        project.status = 'failed'
        project.error = action.payload ?? action.error.message ?? 'Impossibile caricare le viste'
      })
      .addCase(createView.pending, (state) => {
        state.mutationStatus = 'loading'
        state.error = undefined
      })
      .addCase(createView.fulfilled, (state, action) => {
        const view = action.payload
        const project = ensureProjectState(state, view.projectId)
        project.items = [view, ...project.items.filter((item) => item.id !== view.id)]
        project.selectedId = view.id
        state.mutationStatus = 'succeeded'
      })
      .addCase(createView.rejected, (state, action) => {
        state.mutationStatus = 'failed'
        state.error = action.payload ?? action.error.message ?? 'Impossibile salvare la vista'
      })
      .addCase(updateView.pending, (state) => {
        state.mutationStatus = 'loading'
        state.error = undefined
      })
      .addCase(updateView.fulfilled, (state, action) => {
        const updated = action.payload
        const project = ensureProjectState(state, updated.projectId)
        project.items = project.items.map((view) =>
          view.id === updated.id ? updated : view
        )
        state.mutationStatus = 'succeeded'
      })
      .addCase(updateView.rejected, (state, action) => {
        state.mutationStatus = 'failed'
        state.error = action.payload ?? action.error.message ?? 'Impossibile aggiornare la vista'
      })
      .addCase(deleteView.pending, (state) => {
        state.mutationStatus = 'loading'
        state.error = undefined
      })
      .addCase(deleteView.fulfilled, (state, action) => {
        const { projectId, viewId } = action.payload
        const project = ensureProjectState(state, projectId)
        project.items = project.items.filter((view) => view.id !== viewId)
        if (project.selectedId === viewId) {
          project.selectedId = null
        }
        state.mutationStatus = 'succeeded'
      })
      .addCase(deleteView.rejected, (state, action) => {
        state.mutationStatus = 'failed'
        state.error = action.payload ?? action.error.message ?? 'Impossibile eliminare la vista'
      })
  }
})

export const { selectSavedView, clearViewsError } = viewsSlice.actions
export const viewsReducer = viewsSlice.reducer

