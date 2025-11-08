export type LogLevelSetting = 'debug' | 'info' | 'warn' | 'error' | 'silent'
export type RuntimeTarget = 'desktop' | 'webapp'

export interface Env {
  logLevel: LogLevelSetting
  appVersion: string
  runtimeTarget: RuntimeTarget
}
