import { join } from 'node:path'
import { homedir } from 'node:os'

import packageJson from '../../../../package.json'

interface PackageMetadata {
  name?: string
  productName?: string
}

export interface StoragePathOptions {
  userDataDir?: string
  overridePath?: string | null
}

interface StoragePathResolverOptions {
  appIdentifier?: string
  platform?: NodeJS.Platform
  environment?: NodeJS.ProcessEnv
  homeDirectoryProvider?: () => string
}

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
    this.appIdentifier =
      options.appIdentifier ?? StoragePathResolver.resolveDefaultIdentifier(packageJson)
    this.platform = options.platform ?? process.platform
    this.environment = options.environment ?? process.env
    this.homeDirectoryProvider = options.homeDirectoryProvider ?? homedir
  }

  /**
   * Resolves the absolute path to the SQLite file, applying overrides when provided.
   */
  resolve(options: StoragePathOptions = {}): string {
    if (options.overridePath && options.overridePath.trim().length > 0) {
      return options.overridePath
    }
    const baseDir = options.userDataDir ?? this.resolvePlatformUserDataDir()
    return join(baseDir, 'storage', 'app.sqlite')
  }

  /**
   * Mirrors Electron's `app.getPath('userData')` logic so CLI tooling and tests
   * store data exactly where the runtime expects it.
   */
  private resolvePlatformUserDataDir(): string {
    const home = this.homeDirectoryProvider()
    switch (this.platform) {
      case 'win32':
        return join(this.environment.APPDATA ?? join(home, 'AppData', 'Roaming'), this.appIdentifier)
      case 'darwin':
        return join(home, 'Library', 'Application Support', this.appIdentifier)
      default:
        return join(
          this.environment.XDG_CONFIG_HOME ?? join(home, '.config'),
          this.appIdentifier
        )
    }
  }

  private static resolveDefaultIdentifier(metadata: PackageMetadata): string {
    return String(metadata.productName ?? metadata.name ?? 'electron-app')
  }
}

const defaultResolver = new StoragePathResolver()

export const resolveAppStoragePath = (options: StoragePathOptions = {}): string =>
  defaultResolver.resolve(options)

export const storagePathResolver = defaultResolver
