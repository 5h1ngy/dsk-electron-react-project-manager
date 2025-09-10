import type { TaskDetailsDTO, CommentDTO } from '@main/services/task.types'
import type {
  CreateTaskInput,
  UpdateTaskInput,
  MoveTaskInput,
  CreateCommentInput,
  SearchTasksInput
} from '@main/services/task.schemas'
import { invokeIpc } from './shared'

const CHANNELS = {
  list: 'task:list',
  get: 'task:get',
  create: 'task:create',
  update: 'task:update',
  move: 'task:move',
  remove: 'task:delete',
  listComments: 'task:comment:list',
  addComment: 'task:comment:add',
  search: 'task:search'
} as const

export const taskApi = {
  list: async (token: string, projectId: string) =>
    await invokeIpc<TaskDetailsDTO[]>(CHANNELS.list, token, projectId),
  get: async (token: string, taskId: string) =>
    await invokeIpc<TaskDetailsDTO>(CHANNELS.get, token, taskId),
  create: async (token: string, payload: CreateTaskInput) =>
    await invokeIpc<TaskDetailsDTO>(CHANNELS.create, token, payload),
  update: async (token: string, taskId: string, payload: UpdateTaskInput) =>
    await invokeIpc<TaskDetailsDTO>(CHANNELS.update, token, taskId, payload),
  move: async (token: string, taskId: string, payload: MoveTaskInput) =>
    await invokeIpc<TaskDetailsDTO>(CHANNELS.move, token, taskId, payload),
  remove: async (token: string, taskId: string) =>
    await invokeIpc<{ success: boolean }>(CHANNELS.remove, token, taskId),
  listComments: async (token: string, taskId: string) =>
    await invokeIpc<CommentDTO[]>(CHANNELS.listComments, token, taskId),
  addComment: async (token: string, payload: CreateCommentInput) =>
    await invokeIpc<CommentDTO>(CHANNELS.addComment, token, payload),
  search: async (token: string, payload: SearchTasksInput) =>
    await invokeIpc<TaskDetailsDTO[]>(CHANNELS.search, token, payload)
}
