import { z } from 'zod'

import { taskStatusSchema } from '@main/services/task/schemas'

export const TASK_PRIORITY_VALUES = ['low', 'medium', 'high', 'critical'] as const
export const VIEW_COLUMN_VALUES = [
  'key',
  'title',
  'status',
  'priority',
  'assignee',
  'dueDate',
  'commentCount'
] as const
export const VIEW_SORT_FIELD_VALUES = [
  'key',
  'title',
  'status',
  'priority',
  'assignee',
  'dueDate',
  'createdAt'
] as const

const uniqueArray = <T>(value: T[], ctx: z.RefinementCtx) => {
  const seen = new Set<T>()
  for (const item of value) {
    if (seen.has(item)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Valori duplicati non consentiti',
        fatal: true
      })
      return z.NEVER
    }
    seen.add(item)
  }
}

export const viewFilterSchema = z.object({
  searchQuery: z.string().trim().max(160),
  status: z.union([z.literal('all'), taskStatusSchema]),
  priority: z.union([z.literal('all'), z.enum(TASK_PRIORITY_VALUES)]),
  assignee: z.union([z.literal('all'), z.literal('unassigned'), z.string().trim().max(64)]),
  sprint: z
    .union([z.literal('all'), z.literal('backlog'), z.string().trim().max(64)])
    .optional()
    .default('all'),
  dueDateRange: z
    .tuple([z.string().trim().min(1).nullable(), z.string().trim().min(1).nullable()])
    .nullable()
    .refine(
      (value) => {
        if (!value) {
          return true
        }
        const [start, end] = value
        if (!start || !end) {
          return true
        }
        return new Date(start).getTime() <= new Date(end).getTime()
      },
      { message: 'Intervallo date non valido' }
    )
})

export const viewSortSchema = z
  .object({
    field: z.enum(VIEW_SORT_FIELD_VALUES),
    direction: z.enum(['asc', 'desc'])
  })
  .strict()

export const viewColumnsSchema = z
  .array(z.enum(VIEW_COLUMN_VALUES))
  .max(VIEW_COLUMN_VALUES.length)
  .superRefine(uniqueArray)

export const listViewsSchema = z.object({
  projectId: z.string().uuid()
})

export const createViewSchema = z
  .object({
    projectId: z.string().uuid(),
    name: z
      .string()
      .trim()
      .min(1, 'Il nome della vista è obbligatorio')
      .max(80, 'Il nome della vista può contenere al massimo 80 caratteri'),
    filters: viewFilterSchema,
    sort: viewSortSchema.nullable().optional(),
    columns: viewColumnsSchema.optional()
  })
  .transform((value) => ({
    ...value,
    columns: value.columns ?? Array.from(VIEW_COLUMN_VALUES)
  }))

export const updateViewSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Il nome della vista è obbligatorio')
      .max(80, 'Il nome della vista può contenere al massimo 80 caratteri')
      .optional(),
    filters: viewFilterSchema.optional(),
    sort: viewSortSchema.nullable().optional(),
    columns: viewColumnsSchema.optional()
  })
  .refine((value) => Object.keys(value).length > 0, 'Specificare almeno un campo da aggiornare')

export const viewIdSchema = z.object({
  viewId: z.string().uuid()
})

export type CreateViewInput = z.infer<typeof createViewSchema>
export type UpdateViewInput = z.infer<typeof updateViewSchema>
export type ListViewsInput = z.infer<typeof listViewsSchema>
