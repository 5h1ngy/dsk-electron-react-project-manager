import { z } from 'zod'
import { ROLE_NAMES, PASSWORD_POLICY } from './constants'

const usernameRegex = /^[a-zA-Z0-9_.-]+$/

export const LoginSchema = z.object({
  username: z.string().min(3).max(32).regex(usernameRegex, 'Formato username non valido'),
  password: z.string().min(PASSWORD_POLICY.minLength)
})

export type LoginInput = z.infer<typeof LoginSchema>

export const CreateUserSchema = z
  .object({
    username: z.string().min(3).max(32).regex(usernameRegex, 'Formato username non valido'),
    password: z.string().min(PASSWORD_POLICY.minLength),
    displayName: z.string().min(1).max(64),
    isActive: z.boolean().default(true),
    roles: z.array(z.enum(ROLE_NAMES)).min(1, 'Almeno un ruolo richiesto')
  })
  .strict()

export type CreateUserInput = z.infer<typeof CreateUserSchema>

export const RegisterUserSchema = z
  .object({
    username: z.string().min(3).max(32).regex(usernameRegex, 'Formato username non valido'),
    password: z.string().min(PASSWORD_POLICY.minLength),
    displayName: z.string().min(1).max(64)
  })
  .strict()

export type RegisterUserInput = z.infer<typeof RegisterUserSchema>

export const UpdateUserSchema = z
  .object({
    displayName: z.string().min(1).max(64).optional(),
    password: z.string().min(PASSWORD_POLICY.minLength).optional(),
    isActive: z.boolean().optional(),
    roles: z.array(z.enum(ROLE_NAMES)).min(1).optional()
  })
  .strict()

export type UpdateUserInput = z.infer<typeof UpdateUserSchema>
