import { join } from 'node:path'
import { homedir } from 'node:os'

import { logger } from '@services/config/logger'

import type { StoragePathOptions, StoragePathResolverOptions } from '@services/config/storagePath.types'

const DEFAULT_APP_IDENTIFIER =
  process.env.APP_IDENTIFIER ?? process.env.APP_PRODUCT_NAME ?? 'DSK Project Manager'

/**
 * Determines the correct storage destination for the SQLite database, mirroring
 * Electron's per-platform user-data semantics.
 */
export class StoragePathResolver {
  private readonly appIdentifier: string
  private readonly platform: NodeJS.Platform
  private readonly environment: NodeJS.ProcessEnv
  private readonly homeDirectoryProvider: () => string

  constructor(options: StoragePathResolverOptions = {}) {
    this.appIdentifier = options.appIdentifier ?? DEFAULT_APP_IDENTIFIER
    this.platform = options.platform ?? process.platform
    this.environment = options.environment ?? process.env
    this.homeDirectoryProvider = options.homeDirectoryProvider ?? homedir
  }

  /**
   * Resolves the absolute path to the SQLite file, applying overrides when provided.
   */
  resolve(options: StoragePathOptions = {}): string {
    if (options.overridePath && options.overridePath.trim().length > 0) {
      logger.debug(`Using custom storage path override: ${options.overridePath}`, 'Storage')
      return options.overridePath
    }
    const baseDir = options.userDataDir ?? this.resolvePlatformUserDataDir()
    const resolved = join(baseDir, 'storage', 'app.sqlite')
    logger.debug(`Resolved storage path to ${resolved}`, 'Storage')
    return resolved
  }

  /**
   * Mirrors Electron's `app.getPath('userData')` logic so CLI tooling and tests
   * store data exactly where the runtime expects it.
   */
  private resolvePlatformUserDataDir(): string {
    const home = this.homeDirectoryProvider()
    switch (this.platform) {
      case 'win32':
        return join(
          this.environment.APPDATA ?? join(home, 'AppData', 'Roaming'),
          this.appIdentifier
        )
      case 'darwin':
        return join(home, 'Library', 'Application Support', this.appIdentifier)
      default:
        return join(this.environment.XDG_CONFIG_HOME ?? join(home, '.config'), this.appIdentifier)
    }
  }

}

const defaultResolver = new StoragePathResolver()

export const resolveAppStoragePath = (options: StoragePathOptions = {}): string =>
  defaultResolver.resolve(options)
