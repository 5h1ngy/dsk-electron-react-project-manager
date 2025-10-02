#!/usr/bin/env node

import { execSync } from 'node:child_process'

try {
  execSync('git rev-parse --git-dir', { stdio: 'ignore' })
} catch {
  console.error('[hooks] Not a git repository. Skipping hooks installation.')
  process.exit(0)
}

const run = (command, description) => {
  try {
    execSync(command, { stdio: 'inherit' })
    if (description) {
      console.log(description)
    }
  } catch (error) {
    console.error(`[hooks] Command "${command}" failed: ${(error ?? '').message ?? error}`)
    process.exit(1)
  }
}

run('git config core.hooksPath githooks', '[hooks] Git hooks path configured to "githooks/".')
run('git config merge.ff false', '[hooks] merge.ff set to false (merge commits enforced).')
run('git config branch.develop.mergeoptions "--no-ff"', '[hooks] develop merges use --no-ff by default.')
run('git config branch.main.mergeoptions "--no-ff"', '[hooks] main merges use --no-ff by default.')
