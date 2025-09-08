export const ROLE_NAMES = ['Admin', 'Maintainer', 'Contributor', 'Viewer'] as const

export type RoleName = (typeof ROLE_NAMES)[number]

export const SESSION_TIMEOUT_MINUTES = 30

export const SESSION_TOKEN_BYTES = 32

export const PASSWORD_POLICY = {
  minLength: 8
}
