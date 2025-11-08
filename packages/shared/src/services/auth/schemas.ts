import { z } from 'zod'
import { PASSWORD_POLICY, USERNAME_REGEX } from '@services/services/auth/constants'

export const LoginSchema = z.object({
  username: z.string().min(3).max(32).regex(USERNAME_REGEX, 'Formato username non valido'),
  password: z.string().min(PASSWORD_POLICY.minLength)
})

export type LoginInput = z.infer<typeof LoginSchema>

export const CreateUserSchema = z
  .object({
    username: z.string().min(3).max(32).regex(USERNAME_REGEX, 'Formato username non valido'),
    password: z.string().min(PASSWORD_POLICY.minLength),
    displayName: z.string().min(1).max(64),
    isActive: z.boolean().default(true),
    roles: z.array(z.string().min(1).max(64)).min(1, 'Almeno un ruolo richiesto')
  })
  .strict()

export type CreateUserInput = z.infer<typeof CreateUserSchema>

export const RegisterUserSchema = z
  .object({
    username: z.string().min(3).max(32).regex(USERNAME_REGEX, 'Formato username non valido'),
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
    roles: z.array(z.string().min(1).max(64)).min(1).optional()
  })
  .strict()

export type UpdateUserInput = z.infer<typeof UpdateUserSchema>
