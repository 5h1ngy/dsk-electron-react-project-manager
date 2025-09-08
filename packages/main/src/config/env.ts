import { existsSync } from 'node:fs'
import { join } from 'node:path'
import dotenv from 'dotenv'

const rootEnvPath = join(process.cwd(), '.env')

if (existsSync(rootEnvPath)) {
  dotenv.config({ path: rootEnvPath })
}

export type LogLevelSetting = 'debug' | 'info' | 'warn' | 'error' | 'silent'

const parseLogLevel = (value?: string): LogLevelSetting => {
  const normalized = value?.trim().toLowerCase()
  switch (normalized) {
    case 'debug':
      return 'debug'
    case 'info':
      return 'info'
    case 'warn':
      return 'warn'
    case 'error':
      return 'error'
    case 'silent':
      return 'silent'
    default:
      return 'info'
  }
}

export const env = {
  logLevel: parseLogLevel(process.env.LOG_LEVEL)
}

export type Env = typeof env
