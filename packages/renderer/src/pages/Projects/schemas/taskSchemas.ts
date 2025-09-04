import { z } from 'zod'

export const createTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Il titolo è obbligatorio')
    .max(160, 'Massimo 160 caratteri'),
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
    )
})

export type CreateTaskValues = z.infer<typeof createTaskSchema>
