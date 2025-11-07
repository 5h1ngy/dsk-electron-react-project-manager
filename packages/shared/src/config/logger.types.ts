import type { LogLevelSetting } from '@services/config/env.types'

export type LogLevel = 'info' | 'warn' | 'error' | 'success' | 'debug'

export interface LoggerOptions {
  level?: LogLevelSetting
  writer?: (line: string) => void
  clock?: () => Date
}
