export interface StoragePathOptions {
  userDataDir?: string
  overridePath?: string | null
}

export interface StoragePathResolverOptions {
  appIdentifier?: string
  platform?: NodeJS.Platform
  environment?: NodeJS.ProcessEnv
  homeDirectoryProvider?: () => string
}

