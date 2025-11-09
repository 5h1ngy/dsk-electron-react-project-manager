import type { SprintDTO, SprintDetailsDTO } from '@services/services/sprint/types'
import type { CreateSprintInput, UpdateSprintInput } from '@services/services/sprint/schemas'
import { invokeIpc } from '@preload/api/shared'

const CHANNELS = {
  list: 'sprint:list',
  get: 'sprint:get',
  create: 'sprint:create',
  update: 'sprint:update',
  remove: 'sprint:delete'
} as const

export const sprintApi = {
  list: async (token: string, projectId: string) =>
    await invokeIpc<SprintDTO[]>(CHANNELS.list, token, projectId),
  get: async (token: string, sprintId: string) =>
    await invokeIpc<SprintDetailsDTO>(CHANNELS.get, token, sprintId),
  create: async (token: string, payload: CreateSprintInput) =>
    await invokeIpc<SprintDTO>(CHANNELS.create, token, payload),
  update: async (token: string, sprintId: string, payload: UpdateSprintInput) =>
    await invokeIpc<SprintDTO>(CHANNELS.update, token, sprintId, payload),
  remove: async (token: string, sprintId: string) =>
    await invokeIpc<{ success: boolean }>(CHANNELS.remove, token, sprintId)
}
