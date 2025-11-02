#!/usr/bin/env node

import { execSync } from 'node:child_process'

try {
  execSync('git rev-parse --git-dir', { stdio: 'ignore' })
} catch {
  console.error('[hooks] Not a git repository. Skipping hooks installation.')
  process.exit(0)
}

try {
  execSync('git config core.hooksPath scripts/git', { stdio: 'inherit' })
  console.log('[hooks] Git hooks path configured to "scripts/git/".')
} catch (error) {
  console.error(`[hooks] Failed to configure git hooks: ${(error ?? '').message ?? error}`)
  process.exit(1)
}
