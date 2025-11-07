export const OPTIONAL_USER_COLUMNS = ['id', 'lastLoginAt', 'createdAt', 'updatedAt'] as const

export type OptionalUserColumn = (typeof OPTIONAL_USER_COLUMNS)[number]

export const OPTION_LABEL_KEYS: Record<OptionalUserColumn, string> = {
  id: 'dashboard:optionalColumns.columns.id',
  lastLoginAt: 'dashboard:optionalColumns.columns.lastLoginAt',
  createdAt: 'dashboard:optionalColumns.columns.createdAt',
  updatedAt: 'dashboard:optionalColumns.columns.updatedAt'
}
