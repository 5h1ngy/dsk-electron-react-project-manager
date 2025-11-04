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
import type { ProjectDetailsDTO, ProjectSummaryDTO } from '@main/services/project/types'
import type {
  CreateTaskInput,
  UpdateTaskInput,
  MoveTaskInput,
  CreateCommentInput,
  SearchTasksInput
} from '@main/services/task/schemas'
import type { TaskDetailsDTO, CommentDTO } from '@main/services/task/types'
import type { TaskStatusDTO } from '@main/services/taskStatus/types'
import type {
  ListTaskStatusesInput,
  CreateTaskStatusInput,
  UpdateTaskStatusInput,
  ReorderTaskStatusesInput,
  DeleteTaskStatusInput
} from '@main/services/taskStatus/schemas'
import type {
  CreateNoteInput,
  UpdateNoteInput,
  ListNotesInput,
  SearchNotesInput
} from '@main/services/note/schemas'
import type { CreateWikiPageInput, UpdateWikiPageInput } from '@main/services/wiki/schemas'
import type { NoteDetailsDTO, NoteSummaryDTO, NoteSearchResultDTO } from '@main/services/note/types'
import type {
  WikiPageDetailsDTO,
  WikiPageSummaryDTO,
  WikiRevisionDTO
} from '@main/services/wiki/types'
import type { SavedViewDTO } from '@main/services/view/types'
import type { CreateViewInput, UpdateViewInput, ListViewsInput } from '@main/services/view/schemas'
import type { RoleSummary } from '@main/services/roles'
import type { RolePermissionDefinition } from '@main/services/roles/constants'
import type { CreateRoleInput, UpdateRoleInput } from '@main/services/roles/schemas'
import type { SprintDTO, SprintDetailsDTO } from '@main/services/sprint/types'
import type { CreateSprintInput, UpdateSprintInput } from '@main/services/sprint/schemas'
import type {
  CreateTimeEntryInput,
  UpdateTimeEntryInput,
  ProjectTimeSummaryInput
} from '@main/services/timeTracking/schemas'
import type { ProjectTimeSummaryDTO, TimeEntryDTO } from '@main/services/timeTracking/types'
import type {
  DatabaseExportResult,
  DatabaseImportResult,
  DatabaseProgressUpdate,
  DatabaseRestartResult
} from '@main/services/databaseMaintenance/types'
export type { DatabaseProgressUpdate } from '@main/services/databaseMaintenance/types'

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
  deleteUser: (token: string, userId: string) => Promise<IpcResponse<{ success: boolean }>>
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

export interface TaskStatusApi {
  list: (token: string, payload: ListTaskStatusesInput) => Promise<IpcResponse<TaskStatusDTO[]>>
  create: (token: string, payload: CreateTaskStatusInput) => Promise<IpcResponse<TaskStatusDTO>>
  update: (
    token: string,
    statusId: string,
    payload: UpdateTaskStatusInput
  ) => Promise<IpcResponse<TaskStatusDTO>>
  reorder: (
    token: string,
    payload: ReorderTaskStatusesInput
  ) => Promise<IpcResponse<TaskStatusDTO[]>>
  remove: (
    token: string,
    payload: DeleteTaskStatusInput
  ) => Promise<IpcResponse<{ success: boolean }>>
}

export interface NoteApi {
  list: (token: string, payload: ListNotesInput) => Promise<IpcResponse<NoteSummaryDTO[]>>
  get: (token: string, noteId: string) => Promise<IpcResponse<NoteDetailsDTO>>
  create: (token: string, payload: CreateNoteInput) => Promise<IpcResponse<NoteDetailsDTO>>
  update: (
    token: string,
    noteId: string,
    payload: UpdateNoteInput
  ) => Promise<IpcResponse<NoteDetailsDTO>>
  remove: (token: string, noteId: string) => Promise<IpcResponse<{ success: boolean }>>
  search: (token: string, payload: SearchNotesInput) => Promise<IpcResponse<NoteSearchResultDTO[]>>
}

export interface WikiApi {
  list: (token: string, projectId: string) => Promise<IpcResponse<WikiPageSummaryDTO[]>>
  get: (
    token: string,
    projectId: string,
    pageId: string
  ) => Promise<IpcResponse<WikiPageDetailsDTO>>
  create: (
    token: string,
    projectId: string,
    payload: CreateWikiPageInput
  ) => Promise<IpcResponse<WikiPageDetailsDTO>>
  update: (
    token: string,
    projectId: string,
    pageId: string,
    payload: UpdateWikiPageInput
  ) => Promise<IpcResponse<WikiPageDetailsDTO>>
  remove: (
    token: string,
    projectId: string,
    pageId: string
  ) => Promise<IpcResponse<{ success: boolean }>>
  revisions: (
    token: string,
    projectId: string,
    pageId: string
  ) => Promise<IpcResponse<WikiRevisionDTO[]>>
  restore: (
    token: string,
    projectId: string,
    pageId: string,
    revisionId: string
  ) => Promise<IpcResponse<WikiPageDetailsDTO>>
}

export interface ViewApi {
  list: (token: string, payload: ListViewsInput) => Promise<IpcResponse<SavedViewDTO[]>>
  create: (token: string, payload: CreateViewInput) => Promise<IpcResponse<SavedViewDTO>>
  update: (
    token: string,
    viewId: string,
    payload: UpdateViewInput
  ) => Promise<IpcResponse<SavedViewDTO>>
  remove: (token: string, viewId: string) => Promise<IpcResponse<{ success: boolean }>>
}

export interface RoleApi {
  list: (token: string) => Promise<IpcResponse<RoleSummary[]>>
  permissions: (token: string) => Promise<IpcResponse<RolePermissionDefinition[]>>
  create: (token: string, payload: CreateRoleInput) => Promise<IpcResponse<RoleSummary>>
  update: (
    token: string,
    roleId: string,
    payload: UpdateRoleInput
  ) => Promise<IpcResponse<RoleSummary>>
  remove: (token: string, roleId: string) => Promise<IpcResponse<{ success: boolean }>>
}

export interface DatabaseApi {
  export: (token: string, password: string) => Promise<IpcResponse<DatabaseExportResult>>
  import: (token: string, password: string) => Promise<IpcResponse<DatabaseImportResult>>
  restart: (token: string) => Promise<IpcResponse<DatabaseRestartResult>>
  onExportProgress: (handler: (update: DatabaseProgressUpdate) => void) => () => void
  onImportProgress: (handler: (update: DatabaseProgressUpdate) => void) => () => void
}

export interface SprintApi {
  list: (token: string, projectId: string) => Promise<IpcResponse<SprintDTO[]>>
  get: (token: string, sprintId: string) => Promise<IpcResponse<SprintDetailsDTO>>
  create: (token: string, payload: CreateSprintInput) => Promise<IpcResponse<SprintDTO>>
  update: (
    token: string,
    sprintId: string,
    payload: UpdateSprintInput
  ) => Promise<IpcResponse<SprintDTO>>
  remove: (token: string, sprintId: string) => Promise<IpcResponse<{ success: boolean }>>
}

export interface TimeTrackingApi {
  log: (token: string, payload: CreateTimeEntryInput) => Promise<IpcResponse<TimeEntryDTO>>
  update: (
    token: string,
    entryId: string,
    payload: UpdateTimeEntryInput
  ) => Promise<IpcResponse<TimeEntryDTO>>
  remove: (token: string, entryId: string) => Promise<IpcResponse<{ success: boolean }>>
  summary: (
    token: string,
    payload: ProjectTimeSummaryInput
  ) => Promise<IpcResponse<ProjectTimeSummaryDTO>>
}

export interface PreloadApi {
  health: HealthApi
  auth: AuthApi
  project: ProjectApi
  task: TaskApi
  taskStatus: TaskStatusApi
  note: NoteApi
  wiki: WikiApi
  view: ViewApi
  role: RoleApi
  database: DatabaseApi
  sprint: SprintApi
  timeTracking: TimeTrackingApi
}
