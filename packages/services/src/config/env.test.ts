import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

import { EnvConfig } from '@services/config/env'

const resetLogLevel = (value: string | undefined): void => {
  if (value === undefined) {
    delete process.env.LOG_LEVEL
  } else {
    process.env.LOG_LEVEL = value
  }
}

const resetAppVersion = (value: string | undefined): void => {
  if (value === undefined) {
    delete process.env.APP_VERSION
  } else {
    process.env.APP_VERSION = value
  }
}

describe('EnvConfig', () => {
  const originalLogLevel = process.env.LOG_LEVEL
  const originalAppVersion = process.env.APP_VERSION

  afterEach(() => {
    resetLogLevel(originalLogLevel)
    resetAppVersion(originalAppVersion)
  })

  it('reads log level from a custom env file', () => {
    const directory = mkdtempSync(join(tmpdir(), 'env-config-'))
    const path = join(directory, '.env')
    writeFileSync(path, 'LOG_LEVEL=warn\nAPP_VERSION=9.9.9')
    resetLogLevel(undefined)
    resetAppVersion(undefined)

    try {
      const config = EnvConfig.load(path)
      expect(config.logLevel).toBe('warn')
      expect(config.appVersion).toBe('9.9.9')
    } finally {
      rmSync(directory, { recursive: true, force: true })
    }
  })

  it('falls back to info for invalid values', () => {
    resetAppVersion('1.0.0')
    process.env.LOG_LEVEL = 'unsupported'
    const config = EnvConfig.load(join(tmpdir(), 'missing.env'))
    expect(config.logLevel).toBe('info')
    expect(config.appVersion).toBe('1.0.0')
  })

  it('falls back to the package version when APP_VERSION is missing', () => {
    resetAppVersion(undefined)
    const config = EnvConfig.load(join(tmpdir(), 'missing.env'))
    const pkgPath = join(__dirname, '..', '..', '..', '..', 'package.json')
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8')) as { version?: string }
    expect(config.appVersion).toBe(pkg.version)
  })
})
