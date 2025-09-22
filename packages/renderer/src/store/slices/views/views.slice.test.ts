import { viewsReducer, selectSavedView, clearViewsError } from '@renderer/store/slices/views'
import { fetchViews, createView, deleteView } from '@renderer/store/slices/views/thunks'
import type { ViewsState } from '@renderer/store/slices/views/types'

const baseView = () => ({
  id: 'view-1',
  projectId: 'project-1',
  userId: 'user-1',
  name: 'Default',
  filters: {
    searchQuery: '',
    status: 'all' as const,
    priority: 'all' as const,
    assignee: 'all' as const,
    dueDateRange: null
  },
  sort: null,
  columns: ['key', 'title'] as ('key' | 'title' | 'status' | 'priority' | 'assignee' | 'dueDate' | 'commentCount')[],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
})

describe('viewsReducer', () => {
  it('gestisce il caricamento delle viste per progetto', () => {
    const initial = viewsReducer(undefined, { type: '@@INIT' })
    const view = baseView()

    const loaded = viewsReducer(
      initial,
      fetchViews.fulfilled({ projectId: view.projectId, views: [view] }, '', {
        projectId: view.projectId
      })
    )

    expect(loaded.byProjectId[view.projectId].items).toHaveLength(1)
    expect(loaded.byProjectId[view.projectId].status).toBe('succeeded')
  })

  it('aggiunge una nuova vista salvata e la seleziona', () => {
    const state: ViewsState = {
      byProjectId: {
        'project-1': {
          items: [],
          status: 'idle',
          error: undefined,
          selectedId: null
        }
      },
      mutationStatus: 'idle',
      error: undefined
    }

    const view = baseView()
    const next = viewsReducer(state, createView.fulfilled(view, '', {
      projectId: 'project-1',
      name: view.name,
      filters: view.filters,
      sort: null,
      columns: ['key', 'title'] as ('key' | 'title' | 'status' | 'priority' | 'assignee' | 'dueDate' | 'commentCount')[]
    }))

    expect(next.byProjectId['project-1'].items[0].id).toBe(view.id)
    expect(next.byProjectId['project-1'].selectedId).toBe(view.id)
    expect(next.mutationStatus).toBe('succeeded')
  })

  it('seleziona e rimuove una vista salvata', () => {
    const view = baseView()
    const state: ViewsState = {
      byProjectId: {
        'project-1': {
          items: [view],
          status: 'succeeded',
          error: undefined,
          selectedId: view.id
        }
      },
      mutationStatus: 'idle',
      error: undefined
    }

    const afterSelect = viewsReducer(
      state,
      selectSavedView({ projectId: 'project-1', viewId: view.id })
    )
    expect(afterSelect.byProjectId['project-1'].selectedId).toBe(view.id)

    const afterDelete = viewsReducer(
      afterSelect,
      deleteView.fulfilled({ projectId: 'project-1', viewId: view.id }, '', {
        projectId: 'project-1',
        viewId: view.id
      })
    )

    expect(afterDelete.byProjectId['project-1'].items).toHaveLength(0)
    expect(afterDelete.byProjectId['project-1'].selectedId).toBeNull()
  })

  it('pulisce errori globali', () => {
    const state: ViewsState = {
      byProjectId: {},
      mutationStatus: 'failed',
      error: 'errore'
    }

    const next = viewsReducer(state, clearViewsError())
    expect(next.error).toBeUndefined()
    expect(next.mutationStatus).toBe('idle')
  })
})
