import { z } from 'zod'

import type { SprintStatus } from '@main/models/Sprint'

export const sprintStatusSchema = z.enum(['planned', 'active', 'completed', 'archived'])
export type SprintStatusInput = z.infer<typeof sprintStatusSchema>

const identifierSchema = z
  .string()
  .trim()
  .min(1, 'Identifier is required')
  .max(36, 'Identifier too long')

const nameSchema = z
  .string()
  .trim()
  .min(1, 'Name is required')
  .max(120, 'Name must be at most 120 characters')

const optionalGoalSchema = z
  .string()
  .trim()
  .max(1024, 'Goal is too long')
  .transform((value) => (value.length === 0 ? null : value))
  .optional()

const dateSchema = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
  .refine((value) => !Number.isNaN(Date.parse(`${value}T00:00:00Z`)), 'Invalid date')

const optionalDateSchema = dateSchema.optional()

const capacitySchema = z
  .number({ invalid_type_error: 'Capacity must be a number' })
  .int('Capacity must be an integer')
  .min(0, 'Capacity cannot be negative')
  .max(1_000_000, 'Capacity is too large')
  .nullable()
  .optional()

const sequenceSchema = z
  .number({ invalid_type_error: 'Sequence must be a number' })
  .int('Sequence must be an integer')
  .min(0, 'Sequence cannot be negative')
  .optional()

export const createSprintSchema = z
  .object({
    projectId: identifierSchema,
    name: nameSchema,
    goal: optionalGoalSchema,
    startDate: dateSchema,
    endDate: dateSchema,
    status: sprintStatusSchema.default('planned'),
    capacityMinutes: capacitySchema,
    sequence: sequenceSchema
  })
  .refine(
    (value) => {
      const start = Date.parse(`${value.startDate}T00:00:00Z`)
      const end = Date.parse(`${value.endDate}T00:00:00Z`)
      return start <= end
    },
    { message: 'End date must be on or after start date', path: ['endDate'] }
  )

export const updateSprintSchema = z
  .object({
    name: nameSchema.optional(),
    goal: optionalGoalSchema,
    startDate: optionalDateSchema,
    endDate: optionalDateSchema,
    status: sprintStatusSchema.optional(),
    capacityMinutes: capacitySchema,
    sequence: sequenceSchema
  })
  .refine(
    (value) => {
      if (value.startDate === undefined && value.endDate === undefined) {
        return true
      }
      const start = Date.parse(`${value.startDate ?? '1970-01-01'}T00:00:00Z`)
      const end = Date.parse(`${value.endDate ?? '9999-12-31'}T00:00:00Z`)
      if (value.startDate !== undefined && value.endDate !== undefined) {
        return start <= end
      }
      return true
    },
    { message: 'End date must be on or after start date', path: ['endDate'] }
  )
  .refine(
    (value) => Object.keys(value).length > 0,
    'At least one field must be provided for update'
  )

export type CreateSprintInput = z.infer<typeof createSprintSchema>
export type UpdateSprintInput = z.infer<typeof updateSprintSchema>
export type SprintStatusUpdateInput = SprintStatus
