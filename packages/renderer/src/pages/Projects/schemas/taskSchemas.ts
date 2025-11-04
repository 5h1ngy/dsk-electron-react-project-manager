import { z } from 'zod'

export const createTaskSchema = z
  .object({
    title: z.string().trim().min(1, 'Il titolo è obbligatorio').max(160, 'Massimo 160 caratteri'),
    description: z
      .string()
      .trim()
      .max(20000, 'Testo troppo lungo')
      .optional()
      .transform((value) => (value && value.length > 0 ? value : null)),
    priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
    dueDate: z
      .string()
      .optional()
      .refine(
        (value) => {
          if (!value) {
            return true
          }
          const parsed = Date.parse(value)
          if (Number.isNaN(parsed)) {
            return false
          }
          const selected = new Date(parsed)
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          selected.setHours(0, 0, 0, 0)
          return selected.getTime() >= today.getTime()
        },
        { message: 'Data non valida' }
      ),
    sprintId: z
      .union([z.string().trim().min(1).max(36), z.null(), z.undefined()])
      .transform((value) => {
        if (!value || value.length === 0) {
          return null
        }
        return value
      })
  })
  .extend({
    ownerId: z.string().trim().min(1).max(36).optional(),
    estimatedMinutes: z
      .union([z.string(), z.number(), z.null(), z.undefined()])
      .transform((value) => {
        if (value === null || value === undefined) {
          return null
        }
        if (typeof value === 'number') {
          if (!Number.isFinite(value)) {
            return NaN
          }
          return Math.round(value)
        }
        const trimmed = value.trim()
        if (trimmed.length === 0) {
          return null
        }
        if (!/^\d+$/.test(trimmed)) {
          return NaN
        }
        return Number.parseInt(trimmed, 10)
      })
      .refine(
        (value) => value === null || (!Number.isNaN(value) && value >= 0 && value <= 1_000_000),
        'Durata stimata non valida'
      )
      .transform((value) => (value === null ? null : value))
  })

export type CreateTaskValues = z.infer<typeof createTaskSchema>

const taskStatusSchema = z
  .string()
  .trim()
  .min(1, 'Lo stato è obbligatorio')
  .max(48, 'Stato troppo lungo')
  .regex(/^[a-z0-9_-]+$/, 'Stato non valido')
const taskPrioritySchema = z.enum(['low', 'medium', 'high', 'critical'])

const normalizeDescription = z
  .string()
  .trim()
  .max(20000, 'Testo troppo lungo')
  .optional()
  .transform((value) => (value && value.length > 0 ? value : null))

const dueDateInputSchema = z
  .union([z.string().trim(), z.null(), z.undefined()])
  .transform((value) => {
    if (!value || value.length === 0) {
      return null
    }
    return value
  })
  .refine((value) => value === null || /^\d{4}-\d{2}-\d{2}$/.test(value), 'Data non valida')
  .refine((value) => {
    if (!value) {
      return true
    }
    const parsed = Date.parse(`${value}T00:00:00`)
    if (Number.isNaN(parsed)) {
      return false
    }
    const selected = new Date(parsed)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    selected.setHours(0, 0, 0, 0)
    return selected.getTime() >= today.getTime()
  }, 'Data non valida')

const assigneeInputSchema = z
  .union([z.string().trim().min(1).max(36), z.null(), z.undefined()])
  .transform((value) => {
    if (!value || value.length === 0) {
      return null
    }
    return value
  })

const ownerInputSchema = z
  .string()
  .trim()
  .min(1, 'Il proprietario è obbligatorio')
  .max(36, 'Identificativo proprietario non valido')

const sprintInputSchema = z
  .union([z.string().trim().min(1).max(36), z.null(), z.undefined()])
  .transform((value) => {
    if (!value || value.length === 0) {
      return null
    }
    return value
  })

const estimatedMinutesInputSchema = z
  .union([z.string(), z.number(), z.null(), z.undefined()])
  .transform((value) => {
    if (value === null || value === undefined) {
      return null
    }
    if (typeof value === 'number') {
      return Number.isFinite(value) ? Math.round(value) : NaN
    }
    const trimmed = value.trim()
    if (trimmed.length === 0) {
      return null
    }
    if (!/^\d+$/.test(trimmed)) {
      return NaN
    }
    return Number.parseInt(trimmed, 10)
  })
  .refine(
    (value) => value === null || (!Number.isNaN(value) && value >= 0 && value <= 1_000_000),
    'Durata stimata non valida'
  )
  .transform((value) => (value === null ? null : value))

export const taskFormSchema = z.object({
  title: z.string().trim().min(1, 'Il titolo è obbligatorio').max(160, 'Massimo 160 caratteri'),
  description: normalizeDescription,
  status: taskStatusSchema,
  priority: taskPrioritySchema,
  dueDate: dueDateInputSchema,
  assigneeId: assigneeInputSchema,
  ownerId: ownerInputSchema,
  sprintId: sprintInputSchema,
  estimatedMinutes: estimatedMinutesInputSchema
})

export type TaskFormValues = z.infer<typeof taskFormSchema>
