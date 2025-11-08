import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

import { EnvConfig } from '@services/config/env'

const resetVariable = (key: string, value: string | undefined): void => {
  if (value === undefined) {
    delete process.env[key]
  } else {
    process.env[key] = value
  }
}

describe('EnvConfig', () => {
  const originalLogLevel = process.env.LOG_LEVEL
  const originalAppVersion = process.env.APP_VERSION
  const originalRuntime = process.env.APP_RUNTIME
  const originalLogStoragePath = process.env.LOG_STORAGE_PATH

  afterEach(() => {
    resetVariable('LOG_LEVEL', originalLogLevel)
    resetVariable('APP_VERSION', originalAppVersion)
    resetVariable('APP_RUNTIME', originalRuntime)
    resetVariable('LOG_STORAGE_PATH', originalLogStoragePath)
  })

  it('reads values from a custom env file', () => {
    const directory = mkdtempSync(join(tmpdir(), 'env-config-'))
    const path = join(directory, '.env')
    writeFileSync(
      path,
      'LOG_LEVEL=warn\nAPP_VERSION=9.9.9\nAPP_RUNTIME=desktop\nLOG_STORAGE_PATH=logs/api.log'
    )
    resetVariable('LOG_LEVEL', undefined)
    resetVariable('APP_VERSION', undefined)
    resetVariable('APP_RUNTIME', undefined)
    resetVariable('LOG_STORAGE_PATH', undefined)

    try {
      const config = EnvConfig.load(path)
      expect(config.logLevel).toBe('warn')
      expect(config.appVersion).toBe('9.9.9')
      expect(config.runtimeTarget).toBe('desktop')
      expect(config.logStoragePath?.endsWith('logs/api.log')).toBe(true)
    } finally {
      rmSync(directory, { recursive: true, force: true })
    }
  })

  it('falls back to defaults for invalid values', () => {
    resetVariable('APP_VERSION', '1.0.0')
    process.env.LOG_LEVEL = 'unsupported'
    process.env.APP_RUNTIME = 'mobile'
    const config = EnvConfig.load(join(tmpdir(), 'missing.env'))
    expect(config.logLevel).toBe('info')
    expect(config.appVersion).toBe('1.0.0')
    expect(config.runtimeTarget).toBe('desktop')
  })

  it('falls back to the package version when APP_VERSION is missing', () => {
    resetVariable('APP_VERSION', undefined)
    const config = EnvConfig.load(join(tmpdir(), 'missing.env'))
    const pkgPath = join(__dirname, '..', '..', '..', '..', 'package.json')
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8')) as { version?: string }
    expect(config.appVersion).toBe(pkg.version)
  })

  it('derives runtime target from APP_RUNTIME', () => {
    resetVariable('APP_RUNTIME', 'webapp')
    const config = EnvConfig.load(join(tmpdir(), 'missing.env'))
    expect(config.runtimeTarget).toBe('webapp')
  })

  it('returns null logStoragePath when variable is missing', () => {
    resetVariable('LOG_STORAGE_PATH', undefined)
    const config = EnvConfig.load(join(tmpdir(), 'missing.env'))
    expect(config.logStoragePath).toBeNull()
  })
})
