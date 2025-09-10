import { existsSync } from 'node:fs'
import { join } from 'node:path'
import dotenv from 'dotenv'

import type { Env, LogLevelSetting } from '@main/config/env.types'

/**
 * Encapsulates access to environment configuration, ensuring we only expose
 * sanitized values to the rest of the application.
 */
export class EnvConfig {
  private readonly config: Env

  private constructor(config: Env) {
    this.config = config
  }

  static readonly DEFAULT_ENV_PATH = join(process.cwd(), '.env')

  /**
   * Loads environment variables from disk (if present) and returns a typed view.
   */
  static load(envPath: string = EnvConfig.DEFAULT_ENV_PATH): EnvConfig {
    if (existsSync(envPath)) {
      dotenv.config({ path: envPath })
    }
    return new EnvConfig({
      logLevel: EnvConfig.parseLogLevel(process.env.LOG_LEVEL)
    })
  }

  /**
   * Provides a read-only snapshot of the parsed environment.
   */
  toObject(): Env {
    return { ...this.config }
  }

  get logLevel(): LogLevelSetting {
    return this.config.logLevel
  }

  /**
   * Normalizes the LOG_LEVEL variable to a supported set of values, falling
   * back to "info" when the input is missing or invalid.
   */
  private static parseLogLevel(value?: string): LogLevelSetting {
    const normalized = value?.trim().toLowerCase()
    switch (normalized) {
      case 'debug':
      case 'info':
      case 'warn':
      case 'error':
      case 'silent':
        return normalized
      default:
        return 'info'
    }
  }
}

export const env = EnvConfig.load().toObject()
