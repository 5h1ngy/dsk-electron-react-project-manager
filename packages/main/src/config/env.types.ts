export type LogLevelSetting = 'debug' | 'info' | 'warn' | 'error' | 'silent'

export interface Env {
  logLevel: LogLevelSetting
}

