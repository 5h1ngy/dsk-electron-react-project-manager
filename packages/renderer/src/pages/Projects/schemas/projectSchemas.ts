import { z } from 'zod'

const projectKeyRegex = /^[A-Za-z]{2,10}$/

const tagSchema = z
  .string()
  .trim()
  .min(1, 'Tag troppo corto')
  .max(32, 'Tag troppo lungo')
  .regex(/^[A-Za-z0-9\-_]+$/, 'Caratteri ammessi: lettere, numeri, trattino e underscore')
  .transform((value) => value.toLowerCase())

const tagsArraySchema = z
  .array(tagSchema)
  .max(20, 'Troppi tag')
  .transform((tags) => Array.from(new Set(tags)))

export const createProjectSchema = z.object({
  key: z
    .string()
    .trim()
    .min(2, 'Inserire almeno 2 caratteri')
    .max(10, 'Massimo 10 caratteri')
    .regex(projectKeyRegex, 'Usare solo lettere A-Z')
    .transform((value) => value.toUpperCase()),
  name: z
    .string()
    .trim()
    .min(1, 'Il nome è obbligatorio')
    .max(120, 'Massimo 120 caratteri'),
  description: z
    .string()
    .trim()
    .max(2000, 'Massimo 2000 caratteri')
    .optional()
    .transform((value) => (value === undefined || value.length === 0 ? null : value)),
  tags: tagsArraySchema.optional().default([])
})

export const updateProjectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Il nome è obbligatorio')
    .max(120, 'Massimo 120 caratteri'),
  description: z
    .string()
    .trim()
    .max(2000, 'Massimo 2000 caratteri')
    .nullable()
    .optional(),
  tags: tagsArraySchema.optional()
})

export type CreateProjectValues = z.infer<typeof createProjectSchema>
export type UpdateProjectValues = z.infer<typeof updateProjectSchema>
