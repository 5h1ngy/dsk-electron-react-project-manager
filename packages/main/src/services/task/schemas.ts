import { z } from 'zod'

export const taskStatusSchema = z.enum(['todo', 'in_progress', 'blocked', 'done'])
export type TaskStatusInput = z.infer<typeof taskStatusSchema>

export const taskPrioritySchema = z.enum(['low', 'medium', 'high', 'critical'])
export type TaskPriorityInput = z.infer<typeof taskPrioritySchema>

const identifierSchema = z
  .string()
  .trim()
  .min(1, 'Identifier is required')
  .max(36, 'Identifier too long')

const nullableIdentifierSchema = identifierSchema.nullable()

const dueDateSchema = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Due date must be in YYYY-MM-DD format')
  .refine((value) => {
    const parsed = Date.parse(`${value}T00:00:00Z`)
    if (Number.isNaN(parsed)) {
      return false
    }

    const selected = new Date(parsed)
    const today = new Date()
    today.setUTCHours(0, 0, 0, 0)
    selected.setUTCHours(0, 0, 0, 0)

    return selected.getTime() >= today.getTime()
  }, 'Due date cannot be in the past')

const optionalDueDateSchema = dueDateSchema.nullable().optional()

const descriptionValueSchema = z
  .string()
  .trim()
  .max(20000, 'Description too long')
  .transform((value) => (value.length === 0 ? null : value))

const descriptionSchema = z
  .union([descriptionValueSchema, z.null().transform(() => null)])
  .optional()

export const createTaskSchema = z.object({
  projectId: identifierSchema,
  parentId: nullableIdentifierSchema.optional(),
  title: z
    .string()
    .trim()
    .min(1, 'Title is required')
    .max(160, 'Title must be at most 160 characters'),
  description: descriptionSchema,
  status: taskStatusSchema.default('todo'),
  priority: taskPrioritySchema.default('medium'),
  dueDate: optionalDueDateSchema,
  assigneeId: nullableIdentifierSchema.optional()
})

export const updateTaskSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, 'Title is required')
      .max(160, 'Title must be at most 160 characters')
      .optional(),
    description: descriptionSchema,
    status: taskStatusSchema.optional(),
    priority: taskPrioritySchema.optional(),
    dueDate: optionalDueDateSchema,
    assigneeId: nullableIdentifierSchema.optional(),
    parentId: nullableIdentifierSchema.optional()
  })
  .refine(
    (value) => Object.keys(value).length > 0,
    'At least one field must be provided for update'
  )

export const moveTaskSchema = z.object({
  status: taskStatusSchema
})

export const createCommentSchema = z.object({
  taskId: identifierSchema,
  body: z
    .string()
    .trim()
    .min(1, 'Comment cannot be empty')
    .max(5000, 'Comment is too long')
})

export const searchTasksSchema = z.object({
  query: z
    .string()
    .trim()
    .min(1, 'Query is required')
    .max(120, 'Query is too long')
})

export type CreateTaskInput = z.infer<typeof createTaskSchema>
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>
export type MoveTaskInput = z.infer<typeof moveTaskSchema>
export type CreateCommentInput = z.infer<typeof createCommentSchema>
export type SearchTasksInput = z.infer<typeof searchTasksSchema>
