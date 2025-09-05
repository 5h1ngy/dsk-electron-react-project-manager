import { join } from 'node:path'
import { homedir } from 'node:os'

import rootPackage from '../../../../package.json'

interface PackageMetadata {
  name?: string
  productName?: string
}

const packageMetadata = rootPackage as PackageMetadata

const APP_IDENTIFIER = String(packageMetadata.productName ?? packageMetadata.name ?? 'electron-app')

const resolvePlatformUserDataDir = (): string => {
  const home = homedir()
  switch (process.platform) {
    case 'win32':
      return join(process.env.APPDATA ?? join(home, 'AppData', 'Roaming'), APP_IDENTIFIER)
    case 'darwin':
      return join(home, 'Library', 'Application Support', APP_IDENTIFIER)
    default:
      return join(process.env.XDG_CONFIG_HOME ?? join(home, '.config'), APP_IDENTIFIER)
  }
}

export interface StoragePathOptions {
  userDataDir?: string
  overridePath?: string | null
}

export const resolveAppStoragePath = (options: StoragePathOptions = {}): string => {
  if (options.overridePath && options.overridePath.trim().length > 0) {
    return options.overridePath
  }

  const baseDir = options.userDataDir ?? resolvePlatformUserDataDir()
  return join(baseDir, 'storage', 'app.sqlite')
}
