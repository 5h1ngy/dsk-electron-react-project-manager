import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

import { EnvConfig } from '@main/config/env'

const resetLogLevel = (value: string | undefined): void => {
  if (value === undefined) {
    delete process.env.LOG_LEVEL
  } else {
    process.env.LOG_LEVEL = value
  }
}

describe('EnvConfig', () => {
  const originalLogLevel = process.env.LOG_LEVEL

  afterEach(() => {
    resetLogLevel(originalLogLevel)
  })

  it('reads log level from a custom env file', () => {
    const directory = mkdtempSync(join(tmpdir(), 'env-config-'))
    const path = join(directory, '.env')
    writeFileSync(path, 'LOG_LEVEL=warn')
    resetLogLevel(undefined)

    try {
      const config = EnvConfig.load(path)
      expect(config.logLevel).toBe('warn')
    } finally {
      rmSync(directory, { recursive: true, force: true })
    }
  })

  it('falls back to info for invalid values', () => {
    process.env.LOG_LEVEL = 'unsupported'
    const config = EnvConfig.load(join(tmpdir(), 'missing.env'))
    expect(config.logLevel).toBe('info')
  })
})
