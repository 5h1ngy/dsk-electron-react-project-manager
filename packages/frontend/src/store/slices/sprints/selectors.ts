import type { RootState } from '@renderer/store/types'
import type { SprintListState, SprintDetailsState } from '@renderer/store/slices/sprints/types'
import type { SprintDTO } from '@services/services/sprint/types'

const emptyListState: SprintListState = Object.freeze({
  ids: [],
  entities: {},
  status: 'idle',
  error: undefined
})

const emptyDetailsState: SprintDetailsState = Object.freeze({
  data: null,
  status: 'idle',
  error: undefined
})

export const selectSprintsState = (state: RootState) => state.sprints

export const selectSprintsForProject =
  (projectId: string) =>
  (state: RootState): SprintListState =>
    state.sprints.byProjectId[projectId] ?? emptyListState

export const selectSprintList =
  (projectId: string) =>
  (state: RootState): SprintDTO[] => {
    const projectState = selectSprintsForProject(projectId)(state)
    return projectState.ids.map((id) => projectState.entities[id]).filter(Boolean) as SprintDTO[]
  }

export const selectSprintById =
  (projectId: string, sprintId: string) =>
  (state: RootState): SprintDTO | undefined => {
    const projectState = selectSprintsForProject(projectId)(state)
    return projectState.entities[sprintId]
  }

export const selectSprintDetails =
  (sprintId: string) =>
  (state: RootState): SprintDetailsState =>
    state.sprints.detailsById[sprintId] ?? emptyDetailsState

export const selectSprintMutationStatus = (state: RootState) => state.sprints.mutationStatus
