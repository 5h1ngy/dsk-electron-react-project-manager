import { z } from 'zod'
import { ROLE_NAMES } from '@main/services/auth.constants'

export const createUserSchema = z.object({
  username: z.string().min(3).max(32),
  displayName: z.string().min(1).max(64),
  password: z.string().min(8),
  roles: z.array(z.enum(ROLE_NAMES)).min(1),
  isActive: z.boolean()
})

export const updateUserSchema = z.object({
  displayName: z.string().min(1).max(64),
  password: z.string().min(8).optional(),
  roles: z.array(z.enum(ROLE_NAMES)).min(1),
  isActive: z.boolean()
})

export type CreateUserValues = z.infer<typeof createUserSchema>
export type UpdateUserValues = z.infer<typeof updateUserSchema>
