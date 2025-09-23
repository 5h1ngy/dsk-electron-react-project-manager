import {
  createTaskStatus,
  deleteTaskStatus,
  fetchTaskStatuses,
  reorderTaskStatuses,
  updateTaskStatus
} from '@renderer/store/slices/taskStatuses/thunks'
import { taskStatusesReducer } from '@renderer/store/slices/taskStatuses/slice'
import type { TaskStatusesState, TaskStatusItem } from '@renderer/store/slices/taskStatuses/types'

const buildState = (override?: Partial<TaskStatusesState>): TaskStatusesState => ({
  byProjectId: {},
  mutationStatus: 'idle',
  error: undefined,
  ...override
})

const sampleStatus = (overrides?: Partial<TaskStatusItem>): TaskStatusItem => ({
  id: 'status-1',
  projectId: 'project-1',
  key: 'todo',
  label: 'To Do',
  position: 1,
  ...overrides
})

describe('taskStatusesReducer', () => {
  it('gestisce il ciclo di fetch', () => {
    const pendingState = taskStatusesReducer(
      buildState(),
      fetchTaskStatuses.pending('', 'project-1')
    )
    expect(pendingState.byProjectId['project-1']?.status).toBe('loading')

    const fulfilledState = taskStatusesReducer(
      pendingState,
      fetchTaskStatuses.fulfilled(
        {
          projectId: 'project-1',
          statuses: [
            sampleStatus({ id: 'status-2', key: 'in_progress', label: 'In Progress', position: 2 }),
            sampleStatus()
          ]
        },
        '',
        'project-1'
      )
    )
    expect(fulfilledState.byProjectId['project-1']?.status).toBe('succeeded')
    expect(fulfilledState.byProjectId['project-1']?.items.map((status) => status.id)).toEqual([
      'status-1',
      'status-2'
    ])

    const failedState = taskStatusesReducer(
      buildState(),
      fetchTaskStatuses.rejected(new Error('boom'), '', 'project-1', 'Errore')
    )
    expect(failedState.byProjectId['project-1']?.status).toBe('failed')
    expect(failedState.byProjectId['project-1']?.error).toBe('Errore')
  })

  it('gestisce creazione, aggiornamento, riordino e cancellazione', () => {
    const baseStatus = sampleStatus()
    let state = taskStatusesReducer(
      buildState({
        byProjectId: {
          'project-1': {
            items: [baseStatus],
            status: 'succeeded',
            error: undefined
          }
        }
      }),
      createTaskStatus.fulfilled(
        sampleStatus({ id: 'status-2', key: 'blocked', label: 'Blocked', position: 3 }),
        '',
        { projectId: 'project-1', label: 'Blocked' }
      )
    )
    expect(state.byProjectId['project-1']?.items).toHaveLength(2)
    expect(state.mutationStatus).toBe('succeeded')

    state = taskStatusesReducer(
      state,
      updateTaskStatus.fulfilled(
        sampleStatus({ id: 'status-2', label: 'Impeded', position: 2 }),
        '',
        { statusId: 'status-2', payload: { label: 'Impeded' } }
      )
    )
    expect(state.byProjectId['project-1']?.items.find((status) => status.id === 'status-2')?.label).toBe(
      'Impeded'
    )

    state = taskStatusesReducer(
      state,
      reorderTaskStatuses.fulfilled(
        {
          projectId: 'project-1',
          statuses: [
            sampleStatus({ id: 'status-2', label: 'Impeded', position: 1 }),
            sampleStatus({ id: 'status-1', label: 'To Do', position: 2 })
          ]
        },
        '',
        { projectId: 'project-1', order: ['status-2', 'status-1'] }
      )
    )
    expect(state.byProjectId['project-1']?.items[0]?.id).toBe('status-2')

    state = taskStatusesReducer(
      state,
      deleteTaskStatus.fulfilled(
        { projectId: 'project-1', statusId: 'status-2' },
        '',
        { projectId: 'project-1', statusId: 'status-2', fallbackStatusId: 'status-1' }
      )
    )
    expect(state.byProjectId['project-1']?.items).toHaveLength(1)
    expect(state.byProjectId['project-1']?.items[0]?.id).toBe('status-1')
  })
})
