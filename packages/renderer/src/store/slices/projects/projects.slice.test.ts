import { projectsReducer, selectProject } from './slice'
import { projectsAdapter } from './slice'
import {
  createProject,
  fetchProjects
} from './thunks'
import type { ProjectDetails, ProjectSummary } from './types'

describe('projects slice', () => {
  const now = new Date()

  const summary: ProjectSummary = {
    id: 'proj-1',
    key: 'PR1',
    name: 'Progetto Alpha',
    description: 'Descrizione',
    createdBy: 'admin',
    createdAt: now,
    updatedAt: now,
    role: 'admin',
    memberCount: 1,
    tags: ['alpha']
  }

  const details: ProjectDetails = {
    ...summary,
    members: [
      {
        userId: 'admin',
        username: 'admin',
        displayName: 'Administrator',
        isActive: true,
        role: 'admin',
        createdAt: now
      }
    ],
    tags: ['alpha']
  }

  it('returns the initial state', () => {
    const state = projectsReducer(undefined, { type: 'unknown' })
    expect(state.ids).toHaveLength(0)
    expect(state.listStatus).toBe('idle')
  })

  it('handles fetchProjects.fulfilled', () => {
    const state = projectsReducer(
      undefined,
      fetchProjects.fulfilled([summary], 'request-id', undefined)
    )
    expect(state.listStatus).toBe('succeeded')
    expect(projectsAdapter.getSelectors().selectIds(state)).toContain(summary.id)
  })

  it('handles createProject.fulfilled and selection', () => {
    const stateAfterList = projectsReducer(
      undefined,
      fetchProjects.fulfilled([summary], 'request-id', undefined)
    )

    const stateAfterCreate = projectsReducer(
      stateAfterList,
      createProject.fulfilled(details, 'request-id', {
        key: details.key,
        name: details.name,
        description: details.description,
        tags: details.tags
      })
    )

    expect(stateAfterCreate.details[details.id]).toEqual(details)
    const selectedState = projectsReducer(stateAfterCreate, selectProject(details.id))
    expect(selectedState.selectedProjectId).toBe(details.id)
  })
})
