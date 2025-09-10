import type { HealthResponse } from '@main/ipc/health'
import type { SessionPayload, UserDTO } from '@main/services/auth'
import type {
  CreateUserInput,
  UpdateUserInput,
  LoginInput,
  RegisterUserInput
} from '@main/services/auth/schemas'
import type {
  CreateProjectInput,
  UpdateProjectInput,
  ProjectMemberRoleInput
} from '@main/services/project/schemas'
import type {
  ProjectDetailsDTO,
  ProjectSummaryDTO
} from '@main/services/project/types'
import type {
  CreateTaskInput,
  UpdateTaskInput,
  MoveTaskInput,
  CreateCommentInput,
  SearchTasksInput
} from '@main/services/task/schemas'
import type { TaskDetailsDTO, CommentDTO } from '@main/services/task/types'

export interface IpcSuccess<T> {
  ok: true
  data: T
}

export interface IpcError {
  ok: false
  code: string
  message: string
}

export type IpcResponse<T> = IpcSuccess<T> | IpcError

export interface HealthApi {
  check: () => Promise<HealthResponse>
}

export interface AuthApi {
  login: (payload: LoginInput) => Promise<IpcResponse<SessionPayload>>
  register: (payload: RegisterUserInput) => Promise<IpcResponse<SessionPayload>>
  logout: (token: string) => Promise<IpcResponse<{ success: boolean }>>
  session: (token: string) => Promise<IpcResponse<UserDTO | null>>
  listUsers: (token: string) => Promise<IpcResponse<UserDTO[]>>
  createUser: (token: string, payload: CreateUserInput) => Promise<IpcResponse<UserDTO>>
  updateUser: (
    token: string,
    userId: string,
    payload: UpdateUserInput
  ) => Promise<IpcResponse<UserDTO>>
}

export interface ProjectMemberPayload {
  userId: string
  role: ProjectMemberRoleInput
}

export interface ProjectApi {
  list: (token: string) => Promise<IpcResponse<ProjectSummaryDTO[]>>
  get: (token: string, projectId: string) => Promise<IpcResponse<ProjectDetailsDTO>>
  create: (token: string, payload: CreateProjectInput) => Promise<IpcResponse<ProjectDetailsDTO>>
  update: (
    token: string,
    projectId: string,
    payload: UpdateProjectInput
  ) => Promise<IpcResponse<ProjectDetailsDTO>>
  remove: (token: string, projectId: string) => Promise<IpcResponse<{ success: boolean }>>
  addMember: (
    token: string,
    projectId: string,
    payload: ProjectMemberPayload
  ) => Promise<IpcResponse<ProjectDetailsDTO>>
  removeMember: (
    token: string,
    projectId: string,
    userId: string
  ) => Promise<IpcResponse<ProjectDetailsDTO>>
}

export interface TaskApi {
  list: (token: string, projectId: string) => Promise<IpcResponse<TaskDetailsDTO[]>>
  get: (token: string, taskId: string) => Promise<IpcResponse<TaskDetailsDTO>>
  create: (token: string, payload: CreateTaskInput) => Promise<IpcResponse<TaskDetailsDTO>>
  update: (
    token: string,
    taskId: string,
    payload: UpdateTaskInput
  ) => Promise<IpcResponse<TaskDetailsDTO>>
  move: (
    token: string,
    taskId: string,
    payload: MoveTaskInput
  ) => Promise<IpcResponse<TaskDetailsDTO>>
  remove: (token: string, taskId: string) => Promise<IpcResponse<{ success: boolean }>>
  listComments: (token: string, taskId: string) => Promise<IpcResponse<CommentDTO[]>>
  addComment: (token: string, payload: CreateCommentInput) => Promise<IpcResponse<CommentDTO>>
  search: (token: string, payload: SearchTasksInput) => Promise<IpcResponse<TaskDetailsDTO[]>>
}

export interface PreloadApi {
  health: HealthApi
  auth: AuthApi
  project: ProjectApi
  task: TaskApi
}
