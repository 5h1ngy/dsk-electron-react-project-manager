import type { TaskStatusDTO } from '@main/services/taskStatus/types'
import type {
  ListTaskStatusesInput,
  CreateTaskStatusInput,
  UpdateTaskStatusInput,
  ReorderTaskStatusesInput,
  DeleteTaskStatusInput
} from '@main/services/taskStatus/schemas'
import { invokeIpc } from '@preload/api/shared'

const CHANNELS = {
  list: 'taskStatus:list',
  create: 'taskStatus:create',
  update: 'taskStatus:update',
  reorder: 'taskStatus:reorder',
  remove: 'taskStatus:delete'
} as const

export const taskStatusApi = {
  list: async (token: string, payload: ListTaskStatusesInput) =>
    await invokeIpc<TaskStatusDTO[]>(CHANNELS.list, token, payload),
  create: async (token: string, payload: CreateTaskStatusInput) =>
    await invokeIpc<TaskStatusDTO>(CHANNELS.create, token, payload),
  update: async (token: string, statusId: string, payload: UpdateTaskStatusInput) =>
    await invokeIpc<TaskStatusDTO>(CHANNELS.update, token, statusId, payload),
  reorder: async (token: string, payload: ReorderTaskStatusesInput) =>
    await invokeIpc<TaskStatusDTO[]>(CHANNELS.reorder, token, payload),
  remove: async (token: string, payload: DeleteTaskStatusInput) =>
    await invokeIpc<{ success: boolean }>(CHANNELS.remove, token, payload)
}
