import { z } from 'zod'

const identifierSchema = z
  .string()
  .trim()
  .min(1, 'Identifier is required')
  .max(36, 'Identifier too long')

const dateSchema = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
  .refine((value) => !Number.isNaN(Date.parse(`${value}T00:00:00Z`)), 'Invalid date')

const optionalDateSchema = dateSchema.optional().nullable()

const durationSchema = z
  .number({ invalid_type_error: 'Duration must be a number' })
  .int('Duration must be an integer')
  .min(1, 'Duration must be at least one minute')
  .max(24 * 60, 'Duration cannot exceed 24 hours')

const descriptionSchema = z
  .string()
  .trim()
  .max(2000, 'Description too long')
  .transform((value) => (value.length === 0 ? null : value))
  .optional()

export const createTimeEntrySchema = z.object({
  taskId: identifierSchema,
  durationMinutes: durationSchema,
  entryDate: dateSchema,
  description: descriptionSchema
})

export const updateTimeEntrySchema = z
  .object({
    durationMinutes: durationSchema.optional(),
    entryDate: dateSchema.optional(),
    description: descriptionSchema
  })
  .refine(
    (value) => Object.keys(value).length > 0,
    'At least one field must be provided for update'
  )

export const projectTimeSummarySchema = z.object({
  projectId: identifierSchema,
  from: optionalDateSchema,
  to: optionalDateSchema,
  userIds: z.array(identifierSchema).optional(),
  taskIds: z.array(identifierSchema).optional()
})

export type CreateTimeEntryInput = z.infer<typeof createTimeEntrySchema>
export type UpdateTimeEntryInput = z.infer<typeof updateTimeEntrySchema>
export type ProjectTimeSummaryInput = z.infer<typeof projectTimeSummarySchema>
