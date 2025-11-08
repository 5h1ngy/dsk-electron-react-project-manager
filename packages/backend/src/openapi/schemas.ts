import { OpenAPIRegistry, extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'

import {
  LoginSchema,
  RegisterUserSchema,
  CreateUserSchema,
  UpdateUserSchema
} from '@services/services/auth/schemas'
import {
  createProjectSchema,
  updateProjectSchema,
  memberRoleSchema
} from '@services/services/project/schemas'
import {
  createTaskSchema,
  updateTaskSchema,
  moveTaskSchema,
  createCommentSchema,
  searchTasksSchema
} from '@services/services/task/schemas'
import {
  createTaskStatusSchema,
  updateTaskStatusSchema,
  reorderTaskStatusesSchema
} from '@services/services/taskStatus/schemas'
import {
  createNoteSchema,
  updateNoteSchema,
  listNotesSchema,
  searchNotesSchema
} from '@services/services/note/schemas'
import {
  createViewSchema,
  updateViewSchema,
  listViewsSchema,
  viewFilterSchema,
  viewColumnsSchema,
  viewSortSchema
} from '@services/services/view/schemas'
import {
  CreateRoleSchema,
  UpdateRoleSchema,
  RolePermissionSchema
} from '@services/services/roles/schemas'
import {
  createSprintSchema,
  updateSprintSchema,
  sprintStatusSchema
} from '@services/services/sprint/schemas'
import {
  createWikiPageSchema,
  updateWikiPageSchema,
  wikiPageIdSchema
} from '@services/services/wiki/schemas'

extendZodWithOpenApi(z)

export const apiRegistry = new OpenAPIRegistry()

const register = <Schema extends z.ZodTypeAny>(name: string, schema: Schema): Schema => {
  apiRegistry.register(name, schema)
  return schema
}

const isoDateTime = () =>
  z
    .string()
    .datetime()
    .openapi({
      format: 'date-time',
      example: new Date('2024-01-01T00:00:00.000Z').toISOString()
    })

const isoDate = () =>
  z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .openapi({ format: 'date', example: '2024-01-01' })

const idSchema = () => z.string().min(1).max(64)

const nullableString = () => z.string().nullable()

const roleNameSchema = z.string().min(1)

/**
 * Shared DTOs
 */
const userSummarySchema = register(
  'UserSummaryDTO',
  z.object({
    id: idSchema(),
    username: z.string(),
    displayName: z.string()
  })
)

const userDtoSchema = register(
  'UserDTO',
  z.object({
    id: idSchema(),
    username: z.string(),
    displayName: z.string(),
    isActive: z.boolean(),
    roles: z.array(roleNameSchema),
    lastLoginAt: isoDateTime().nullable(),
    createdAt: isoDateTime(),
    updatedAt: isoDateTime()
  })
)

register(
  'SessionPayload',
  z.object({
    token: z.string(),
    user: userDtoSchema
  })
)

register('UserList', z.array(userDtoSchema))

/**
 * Project schemas
 */
const projectOwnerSchema = register(
  'ProjectOwnerDTO',
  z.object({
    id: idSchema(),
    username: z.string(),
    displayName: nullableString()
  })
)

const projectMemberSchema = register(
  'ProjectMemberDTO',
  z.object({
    userId: idSchema(),
    username: z.string(),
    displayName: z.string(),
    isActive: z.boolean(),
    role: z.string(),
    createdAt: isoDateTime()
  })
)

const projectSummarySchema = register(
  'ProjectSummaryDTO',
  z.object({
    id: idSchema(),
    key: z.string(),
    name: z.string(),
    description: nullableString(),
    createdBy: idSchema(),
    createdAt: isoDateTime(),
    updatedAt: isoDateTime(),
    role: z.string(),
    memberCount: z.number(),
    tags: z.array(z.string()),
    owner: projectOwnerSchema
  })
)

register(
  'ProjectDetailsDTO',
  projectSummarySchema.extend({
    members: z.array(projectMemberSchema)
  })
)

register('ProjectSummaryList', z.array(projectSummarySchema))

/**
 * Task schemas
 */
const taskNoteLinkSchema = register(
  'TaskNoteLinkDTO',
  z.object({
    id: idSchema(),
    title: z.string(),
    isPrivate: z.boolean(),
    ownerId: idSchema()
  })
)

const sprintSummarySchema = register(
  'SprintSummaryDTO',
  z.object({
    id: idSchema(),
    projectId: idSchema(),
    name: z.string(),
    status: z.string(),
    startDate: isoDate(),
    endDate: isoDate(),
    goal: nullableString(),
    capacityMinutes: z.number().nullable(),
    sequence: z.number()
  })
)

const taskDetailsSchema = register(
  'TaskDetailsDTO',
  z.object({
    id: idSchema(),
    projectId: idSchema(),
    key: z.string(),
    parentId: nullableString(),
    title: z.string(),
    description: nullableString(),
    status: z.string(),
    priority: z.string(),
    dueDate: isoDate().nullable(),
    assignee: userSummarySchema.nullable(),
    owner: userSummarySchema,
    sprintId: nullableString(),
    sprint: sprintSummarySchema.nullable(),
    estimatedMinutes: z.number().nullable(),
    createdAt: isoDateTime(),
    updatedAt: isoDateTime(),
    projectKey: z.string(),
    linkedNotes: z.array(taskNoteLinkSchema),
    commentCount: z.number()
  })
)

register('TaskDetailsList', z.array(taskDetailsSchema))

const commentSchema = register(
  'CommentDTO',
  z.object({
    id: idSchema(),
    taskId: idSchema(),
    author: userSummarySchema,
    body: z.string(),
    createdAt: isoDateTime(),
    updatedAt: isoDateTime()
  })
)

register('CommentList', z.array(commentSchema))

/**
 * Task status schemas
 */
const taskStatusSchema = register(
  'TaskStatusDTO',
  z.object({
    id: idSchema(),
    projectId: idSchema(),
    key: z.string(),
    label: z.string(),
    position: z.number()
  })
)
register('TaskStatusList', z.array(taskStatusSchema))

/**
 * Note schemas
 */
const noteTaskLinkSchema = register(
  'NoteTaskLinkDTO',
  z.object({
    id: idSchema(),
    key: z.string(),
    title: z.string()
  })
)

const noteSummarySchema = register(
  'NoteSummaryDTO',
  z.object({
    id: idSchema(),
    projectId: idSchema(),
    title: z.string(),
    notebook: nullableString(),
    isPrivate: z.boolean(),
    tags: z.array(z.string()),
    owner: userSummarySchema,
    createdAt: isoDateTime(),
    updatedAt: isoDateTime(),
    linkedTasks: z.array(noteTaskLinkSchema)
  })
)

register(
  'NoteDetailsDTO',
  noteSummarySchema.extend({
    body: z.string()
  })
)

const noteSearchSchema = register(
  'NoteSearchResultDTO',
  noteSummarySchema.extend({
    highlight: nullableString()
  })
)

register('NoteSummaryList', z.array(noteSummarySchema))
register('NoteSearchResultList', z.array(noteSearchSchema))

/**
 * View schemas
 */
const savedViewSchema = register(
  'SavedViewDTO',
  z.object({
    id: z.string().uuid(),
    projectId: z.string().uuid(),
    userId: z.string().uuid(),
    name: z.string(),
    filters: viewFilterSchema,
    sort: viewSortSchema.nullable(),
    columns: viewColumnsSchema,
    createdAt: isoDateTime(),
    updatedAt: isoDateTime()
  })
)
register('SavedViewList', z.array(savedViewSchema))

/**
 * Role schemas
 */
const roleSummarySchema = register(
  'RoleSummary',
  z.object({
    id: idSchema(),
    name: z.string(),
    description: nullableString(),
    permissions: z.array(z.string()),
    userCount: z.number(),
    isSystemRole: z.boolean(),
    createdAt: isoDateTime(),
    updatedAt: isoDateTime()
  })
)

register('RoleSummaryList', z.array(roleSummarySchema))

const rolePermissionDefinitionSchema = register(
  'RolePermissionDefinition',
  z.object({
    key: z.string(),
    label: z.string(),
    description: z.string()
  })
)
register('RolePermissionDefinitionList', z.array(rolePermissionDefinitionSchema))

/**
 * Sprint schemas
 */
const sprintMetricsSchema = register(
  'SprintMetricsDTO',
  z.object({
    totalTasks: z.number(),
    estimatedMinutes: z.number(),
    statusBreakdown: z.record(z.number())
  })
)

const sprintDtoSchema = register(
  'SprintDTO',
  sprintSummarySchema.extend({
    metrics: sprintMetricsSchema
  })
)

register(
  'SprintDetailsDTO',
  sprintDtoSchema.extend({
    tasks: z.array(taskDetailsSchema)
  })
)

register('SprintList', z.array(sprintDtoSchema))

/**
 * Wiki schemas
 */
const wikiPageSummarySchema = register(
  'WikiPageSummaryDTO',
  z.object({
    id: idSchema(),
    projectId: idSchema(),
    title: z.string(),
    slug: z.string(),
    summary: nullableString(),
    displayOrder: z.number(),
    createdBy: idSchema(),
    updatedBy: idSchema(),
    createdAt: isoDateTime(),
    updatedAt: isoDateTime()
  })
)

register(
  'WikiPageDetailsDTO',
  wikiPageSummarySchema.extend({
    contentMd: z.string()
  })
)

const wikiRevisionSchema = register(
  'WikiRevisionDTO',
  z.object({
    id: idSchema(),
    pageId: idSchema(),
    title: z.string(),
    summary: nullableString(),
    contentMd: z.string(),
    createdBy: idSchema(),
    createdAt: isoDateTime()
  })
)

register('WikiPageSummaryList', z.array(wikiPageSummarySchema))
register('WikiRevisionList', z.array(wikiRevisionSchema))

/**
 * Health & misc schemas
 */
register(
  'HealthStatus',
  z.object({
    status: z.literal('healthy'),
    version: z.string(),
    timestamp: isoDateTime(),
    uptimeSeconds: z.number()
  })
)

const successResponseSchema = register(
  'OperationResult',
  z.object({
    success: z.boolean().default(true)
  })
)

/**
 * Request schemas registration
 */
register('LoginRequest', LoginSchema)
register('RegisterUserRequest', RegisterUserSchema)
register('CreateUserRequest', CreateUserSchema)
register('UpdateUserRequest', UpdateUserSchema)

register('CreateProjectRequest', createProjectSchema)
register('UpdateProjectRequest', updateProjectSchema)
register(
  'ProjectMemberRequest',
  z.object({
    userId: z.string().min(1),
    role: memberRoleSchema
  })
)

register('CreateTaskRequest', createTaskSchema)
register('UpdateTaskRequest', updateTaskSchema)
register('MoveTaskRequest', moveTaskSchema)
register('CreateCommentRequest', createCommentSchema)
register('SearchTasksRequest', searchTasksSchema)

register('CreateTaskStatusRequest', createTaskStatusSchema)
register('UpdateTaskStatusRequest', updateTaskStatusSchema)
register('ReorderTaskStatusRequest', reorderTaskStatusesSchema)
register(
  'DeleteTaskStatusRequest',
  z.object({
    fallbackStatusId: z.string().min(1)
  })
)

register('CreateNoteRequest', createNoteSchema)
register('UpdateNoteRequest', updateNoteSchema)
register('ListNotesRequest', listNotesSchema)
register('SearchNotesRequest', searchNotesSchema)

register('ListViewsRequest', listViewsSchema)
register('CreateViewRequest', createViewSchema)
register('UpdateViewRequest', updateViewSchema)

register('CreateRoleRequest', CreateRoleSchema)
register('UpdateRoleRequest', UpdateRoleSchema)
register('RolePermissionsRequest', z.array(RolePermissionSchema))

register('CreateSprintRequest', createSprintSchema)
register('UpdateSprintRequest', updateSprintSchema)
register('UpdateSprintStatusRequest', sprintStatusSchema)

register('CreateWikiPageRequest', createWikiPageSchema)
register('UpdateWikiPageRequest', updateWikiPageSchema)
register('WikiPageIdentifier', wikiPageIdSchema)

export const schemaRef = (name: string) => ({
  $ref: `#/components/schemas/${name}`
})

export const jsonContent = (name: string) => ({
  'application/json': {
    schema: schemaRef(name)
  }
})

export const successResponseRef = schemaRef('OperationResult')
export const successResponseContent = jsonContent('OperationResult')
export const operationResultSchema = successResponseSchema
