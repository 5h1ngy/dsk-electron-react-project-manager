import { z } from 'zod'

const projectKeySchema = z
  .string()
  .min(2)
  .max(10)
  .regex(/^[A-Za-z]{2,10}$/)
  .transform((value) => value.toUpperCase())
  .refine((value) => /^[A-Z]{2,10}$/.test(value), 'Key must contain only letters A-Z (2-10).')

export const createProjectSchema = z.object({
  key: projectKeySchema,
  name: z.string().min(1).max(120),
  description: z.string().max(2000).nullable().optional()
})

export const updateProjectSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  description: z.string().max(2000).nullable().optional()
})

export const memberRoleSchema = z.enum(['view', 'edit', 'admin'])

export type CreateProjectInput = z.infer<typeof createProjectSchema>
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>
export type ProjectMemberRoleInput = z.infer<typeof memberRoleSchema>
