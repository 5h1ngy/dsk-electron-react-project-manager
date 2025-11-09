import { z } from 'zod'

const identifierSchema = z
  .string()
  .trim()
  .min(1, 'Identifier is required')
  .max(36, 'Identifier too long')

const statusKeySchema = z
  .string()
  .trim()
  .min(2, 'Key must be at least 2 characters')
  .max(48, 'Key must be at most 48 characters')
  .regex(/^[a-z0-9_-]+$/, 'Key can contain lowercase letters, numbers, underscores or hyphens')

const statusLabelSchema = z
  .string()
  .trim()
  .min(1, 'Label is required')
  .max(80, 'Label must be at most 80 characters')

export const listTaskStatusesSchema = z.object({
  projectId: identifierSchema
})

export const createTaskStatusSchema = z.object({
  projectId: identifierSchema,
  label: statusLabelSchema,
  key: statusKeySchema.optional()
})

export const updateTaskStatusSchema = z
  .object({
    label: statusLabelSchema.optional()
  })
  .refine((value) => Object.keys(value).length > 0, 'Provide at least one field to update')

export const reorderTaskStatusesSchema = z.object({
  projectId: identifierSchema,
  order: z.array(identifierSchema).min(1, 'Statuses order cannot be empty')
})

export const deleteTaskStatusSchema = z.object({
  statusId: identifierSchema,
  fallbackStatusId: identifierSchema
})

export type ListTaskStatusesInput = z.infer<typeof listTaskStatusesSchema>
export type CreateTaskStatusInput = z.infer<typeof createTaskStatusSchema>
export type UpdateTaskStatusInput = z.infer<typeof updateTaskStatusSchema>
export type ReorderTaskStatusesInput = z.infer<typeof reorderTaskStatusesSchema>
export type DeleteTaskStatusInput = z.infer<typeof deleteTaskStatusSchema>
