import { config } from 'dotenv'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const rootDir = resolve(__dirname, '..')

config({ path: resolve(rootDir, '.env') })

if (!process.env.APP_VERSION) {
  try {
    const pkg = JSON.parse(readFileSync(resolve(rootDir, 'package.json'), 'utf8'))
    if (pkg?.version && typeof pkg.version === 'string') {
      process.env.APP_VERSION = pkg.version
    }
  } catch {
    process.env.APP_VERSION = '0.0.0'
  }
}

process.env.VITE_APP_RUNTIME = process.env.VITE_APP_RUNTIME ?? 'webapp'
process.env.APP_RUNTIME = process.env.APP_RUNTIME ?? 'webapp'
