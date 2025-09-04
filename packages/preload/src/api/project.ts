import type {
  ProjectDetailsDTO,
  ProjectSummaryDTO
} from '@main/services/projectService'
import type { CreateProjectInput, UpdateProjectInput } from '@main/services/projectValidation'
import type { ProjectMemberPayload } from '../types'
import { invokeIpc } from './shared'

const CHANNELS = {
  list: 'project:list',
  get: 'project:get',
  create: 'project:create',
  update: 'project:update',
  remove: 'project:delete',
  addMember: 'project:add-member',
  removeMember: 'project:remove-member'
} as const

export const projectApi = {
  list: async (token: string) =>
    await invokeIpc<ProjectSummaryDTO[]>(CHANNELS.list, token),
  get: async (token: string, projectId: string) =>
    await invokeIpc<ProjectDetailsDTO>(CHANNELS.get, token, projectId),
  create: async (token: string, payload: CreateProjectInput) =>
    await invokeIpc<ProjectDetailsDTO>(CHANNELS.create, token, payload),
  update: async (token: string, projectId: string, payload: UpdateProjectInput) =>
    await invokeIpc<ProjectDetailsDTO>(CHANNELS.update, token, projectId, payload),
  remove: async (token: string, projectId: string) =>
    await invokeIpc<{ success: boolean }>(CHANNELS.remove, token, projectId),
  addMember: async (token: string, projectId: string, payload: ProjectMemberPayload) =>
    await invokeIpc<ProjectDetailsDTO>(CHANNELS.addMember, token, projectId, payload),
  removeMember: async (token: string, projectId: string, userId: string) =>
    await invokeIpc<ProjectDetailsDTO>(CHANNELS.removeMember, token, projectId, userId)
}
