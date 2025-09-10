import { z } from 'zod'

const projectKeySchema = z
  .string()
  .min(2)
  .max(10)
  .regex(/^[A-Za-z]{2,10}$/)
  .transform((value) => value.toUpperCase())
  .refine((value) => /^[A-Z]{2,10}$/.test(value), 'Key must contain only letters A-Z (2-10).')

const projectTagSchema = z
  .string()
  .trim()
  .min(1, 'Tag too short')
  .max(32, 'Tag too long')
  .regex(/^[A-Za-z0-9\-_]+$/, 'Tags may contain letters, numbers, hyphen and underscore')
  .transform((value) => value.toLowerCase())

const tagsArraySchema = z
  .array(projectTagSchema)
  .max(20, 'Too many tags')
  .transform((tags) => Array.from(new Set(tags)))

export const createProjectSchema = z.object({
  key: projectKeySchema,
  name: z.string().min(1).max(120),
  description: z.string().max(2000).nullable().optional(),
  tags: tagsArraySchema.optional().default([])
})

export const updateProjectSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  description: z.string().max(2000).nullable().optional(),
  tags: tagsArraySchema.optional()
})

export const memberRoleSchema = z.enum(['view', 'edit', 'admin'])

export type CreateProjectInput = z.infer<typeof createProjectSchema>
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>
export type ProjectMemberRoleInput = z.infer<typeof memberRoleSchema>
