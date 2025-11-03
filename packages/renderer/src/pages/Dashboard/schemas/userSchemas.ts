import { z } from 'zod'

import { PASSWORD_POLICY, USERNAME_REGEX } from '@main/services/auth/constants'

const trimInput = <T extends z.ZodTypeAny>(schema: T): z.ZodEffects<T> =>
  z.preprocess((value) => (typeof value === 'string' ? value.trim() : value), schema)

export interface CreateUserValidationMessages {
  usernameRequired: string
  usernameMin: string
  usernameMax: string
  usernamePattern: string
  displayNameRequired: string
  displayNameMax: string
  passwordRequired: string
  passwordMin: string
  rolesRequired: string
}

export interface UpdateUserValidationMessages {
  displayNameRequired: string
  displayNameMax: string
  passwordMin: string
  rolesRequired: string
}

export const defaultCreateUserMessages: CreateUserValidationMessages = {
  usernameRequired: 'Username is required',
  usernameMin: 'Username must be at least 3 characters long',
  usernameMax: 'Username can be at most 32 characters long',
  usernamePattern: 'Username can only contain letters, numbers, dots, dashes or underscores',
  displayNameRequired: 'Name is required',
  displayNameMax: 'Name can be at most 64 characters long',
  passwordRequired: 'Password is required',
  passwordMin: `Password must be at least ${PASSWORD_POLICY.minLength} characters long`,
  rolesRequired: 'Select at least one role'
}

export const defaultUpdateUserMessages: UpdateUserValidationMessages = {
  displayNameRequired: 'Name is required',
  displayNameMax: 'Name can be at most 64 characters long',
  passwordMin: `Password must be at least ${PASSWORD_POLICY.minLength} characters long`,
  rolesRequired: 'Select at least one role'
}

const buildUsernameSchema = (messages: CreateUserValidationMessages) =>
  trimInput(
    z
      .string({ required_error: messages.usernameRequired })
      .min(1, { message: messages.usernameRequired })
      .min(3, { message: messages.usernameMin })
      .max(32, { message: messages.usernameMax })
      .regex(USERNAME_REGEX, { message: messages.usernamePattern })
  )

const buildDisplayNameSchema = (messages: {
  required: string
  max: string
}) =>
  trimInput(
    z
      .string({ required_error: messages.required })
      .min(1, { message: messages.required })
      .max(64, { message: messages.max })
  )

const buildRolesSchema = (message: string) =>
  z
    .array(trimInput(z.string().min(1, { message })))
    .min(1, { message })

const buildCreatePasswordSchema = (messages: CreateUserValidationMessages) =>
  z
    .string({ required_error: messages.passwordRequired })
    .min(PASSWORD_POLICY.minLength, { message: messages.passwordMin })

const buildUpdatePasswordSchema = (messages: UpdateUserValidationMessages) =>
  z.preprocess(
    (value) => {
      if (typeof value !== 'string') {
        return undefined
      }
      const trimmed = value.trim()
      return trimmed.length === 0 ? undefined : trimmed
    },
    z
      .string()
      .min(PASSWORD_POLICY.minLength, { message: messages.passwordMin })
      .optional()
  )

export const buildCreateUserSchema = (messages: CreateUserValidationMessages) =>
  z.object({
    username: buildUsernameSchema(messages),
    displayName: buildDisplayNameSchema({
      required: messages.displayNameRequired,
      max: messages.displayNameMax
    }),
    password: buildCreatePasswordSchema(messages),
    roles: buildRolesSchema(messages.rolesRequired),
    isActive: z.boolean()
  })

export const buildUpdateUserSchema = (messages: UpdateUserValidationMessages) =>
  z.object({
    displayName: buildDisplayNameSchema({
      required: messages.displayNameRequired,
      max: messages.displayNameMax
    }),
    password: buildUpdatePasswordSchema(messages),
    roles: buildRolesSchema(messages.rolesRequired),
    isActive: z.boolean()
  })

export const createUserSchema = buildCreateUserSchema(defaultCreateUserMessages)
export const updateUserSchema = buildUpdateUserSchema(defaultUpdateUserMessages)

export type CreateUserValues = z.infer<typeof createUserSchema>
export type UpdateUserValues = z.infer<typeof updateUserSchema>
