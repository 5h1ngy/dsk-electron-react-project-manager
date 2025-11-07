#!/usr/bin/env node

/**
 * Guarded wrapper around `electron-builder install-app-deps`.
 * Prevents the command from recursively spawning itself when npm install
 * runs inside electron-builder packaging and allows opting out via env vars.
 */

import { spawnSync } from 'node:child_process'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

const SKIP_FLAG = 'SKIP_ELECTRON_BUILDER_POSTINSTALL'
const REENTRY_FLAG = 'ELECTRON_BUILDER_POSTINSTALL_RUNNING'

if (process.env[SKIP_FLAG] === '1') {
  console.log(`[postinstall] ${SKIP_FLAG}=1, skipping electron-builder install-app-deps.`)
  process.exit(0)
}

if (process.env[REENTRY_FLAG] === '1') {
  console.log('[postinstall] Already running inside electron-builder. Skipping to avoid recursion.')
  process.exit(0)
}

let cliPath
try {
  cliPath = require.resolve('electron-builder/cli.js')
} catch (err) {
  console.error('[postinstall] Unable to resolve electron-builder CLI:', err?.message ?? err)
  process.exit(1)
}

const child = spawnSync(process.execPath, [cliPath, 'install-app-deps'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    [REENTRY_FLAG]: '1'
  },
  shell: false
})

if (child.error) {
  throw child.error
}

if (child.status !== 0) {
  console.error('[postinstall] electron-builder install-app-deps failed.')
  process.exit(child.status ?? 1)
}
