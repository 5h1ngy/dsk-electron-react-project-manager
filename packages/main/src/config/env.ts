import { existsSync, readFileSync } from 'node:fs'
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
      logLevel: EnvConfig.parseLogLevel(process.env.LOG_LEVEL),
      appVersion: EnvConfig.resolveAppVersion(process.env.APP_VERSION)
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

  get appVersion(): string {
    return this.config.appVersion
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

  private static resolveAppVersion(value?: string): string {
    const normalized = EnvConfig.normalizeVersion(value)
    if (normalized) {
      return normalized
    }

    const fallback =
      EnvConfig.tryGetVersionFromElectron() ?? EnvConfig.tryGetVersionFromPackageFiles()
    if (fallback) {
      return fallback
    }

    throw new Error('APP_VERSION is required in the environment')
  }

  private static normalizeVersion(value?: string): string | undefined {
    const normalized = value?.trim()
    if (!normalized || normalized === 'undefined' || normalized === 'null') {
      return undefined
    }
    return normalized
  }

  private static tryGetVersionFromElectron(): string | undefined {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
      const { app } = require('electron') as typeof import('electron')
      const version = EnvConfig.normalizeVersion(app?.getVersion?.())
      return version ?? undefined
    } catch {
      return undefined
    }
  }

  private static tryGetVersionFromPackageFiles(): string | undefined {
    const candidates = EnvConfig.versionFileCandidates()
    for (const candidate of candidates) {
      const version = EnvConfig.readVersionFromFile(candidate)
      if (version) {
        return version
      }
    }
    return undefined
  }

  private static versionFileCandidates(): string[] {
    const candidates = [join(process.cwd(), 'package.json')]

    const resourcesPath = process.resourcesPath
    if (resourcesPath) {
      candidates.push(
        join(resourcesPath, 'app.asar', 'package.json'),
        join(resourcesPath, 'app', 'package.json')
      )
    }

    return candidates
  }

  private static readVersionFromFile(path: string): string | undefined {
    try {
      if (!existsSync(path)) {
        return undefined
      }
      const raw = readFileSync(path, 'utf8')
      const pkg = JSON.parse(raw) as { version?: unknown }
      if (typeof pkg.version === 'string') {
        return EnvConfig.normalizeVersion(pkg.version)
      }
    } catch {
      return undefined
    }
    return undefined
  }
}

export const env = EnvConfig.load().toObject()
