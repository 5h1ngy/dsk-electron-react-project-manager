#!/usr/bin/env node

import { readFileSync } from 'node:fs'
import { execSync, spawnSync } from 'node:child_process'
import { resolve } from 'node:path'

const [, , messagePath, commitSource] = process.argv

if (commitSource !== 'merge') {
  process.exit(0)
}

const run = (command) => {
  try {
    return execSync(command, { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim()
  } catch {
    return ''
  }
}

const readMessage = () => {
  try {
    return readFileSync(resolve(messagePath), 'utf8')
  } catch (error) {
    console.error(`[prepare-commit-msg] Unable to read merge commit message: ${(error ?? '').message ?? error}`)
    process.exit(1)
  }
}

const currentBranch = run('git rev-parse --abbrev-ref HEAD')
const mergeMessage = readMessage()

const extractSourceBranch = () => {
  const patterns = [
    /Merge (?:remote-tracking )?branch ['"]([^'"]+)['"]/,
    /Merge pull request #[0-9]+ from [^/]+\/([^\s]+)/,
    /Merge (?:branch )?([^\s'"]+)/
  ]

  for (const pattern of patterns) {
    const match = mergeMessage.match(pattern)
    if (match?.[1]) {
      return match[1]
    }
  }

  const fromNameRev = run('git name-rev --name-only MERGE_HEAD')
  if (fromNameRev) {
    return fromNameRev.split('~')[0]
  }

  return ''
}

const sourceBranch = extractSourceBranch().replace(/^origin\//, '')

if (!currentBranch) {
  console.error('[prepare-commit-msg] Unable to determine the current branch for merge validation.')
  process.exit(1)
}

if (!sourceBranch) {
  console.error('[prepare-commit-msg] Unable to determine the source branch being merged. Please adjust the merge message manually.')
  process.exit(1)
}

const rules = new Map([
  [
    'main',
    {
      allowedPrefixes: ['release/', 'hotfix/'],
      error:
        'Only branches starting with "release/" or "hotfix/" can be merged into main.'
    }
  ],
  [
    'develop',
    {
      allowedPrefixes: ['feature/', 'feat/', 'bugfix/', 'bug/', 'fix/'],
      error:
        'Only branches starting with "feature/", "feat/", "bugfix/", "bug/" or "fix/" can be merged into develop.'
    }
  ]
])

const rule = rules.get(currentBranch)

if (!rule) {
  process.exit(0)
}

const isAllowed = rule.allowedPrefixes.some((prefix) => sourceBranch.startsWith(prefix))

if (!isAllowed) {
  console.error(
    `[prepare-commit-msg] Merge rejected. Current branch: "${currentBranch}". Source branch "${sourceBranch}" violates policy. ${rule.error}`
  )
  process.exit(1)
}

const repoRoot = run('git rev-parse --show-toplevel') || process.cwd()
const versionFiles = ['.env', 'package.json', 'package-lock.json', 'README.md']

const hasDiff = () => {
  const diffWorking = spawnSync('git', ['diff', '--quiet', '--', ...versionFiles], {
    cwd: repoRoot
  }).status !== 0
  const diffCached = spawnSync('git', ['diff', '--quiet', '--cached', '--', ...versionFiles], {
    cwd: repoRoot
  }).status !== 0
  return diffWorking || diffCached
}

if (!hasDiff()) {
  const versionScript = resolve(repoRoot, 'scripts/version/apply-version-bump.mjs')
  const result = spawnSync(
    'node',
    [versionScript, '--branch', sourceBranch, '--target', currentBranch],
    { cwd: repoRoot, encoding: 'utf8' }
  )

  if (result.status !== 0) {
    process.stderr.write(result.stderr ?? '')
    process.stdout.write(result.stdout ?? '')
    process.exit(result.status ?? 1)
  }

  let payload = {}
  const trimmed = (result.stdout ?? '').trim()
  if (trimmed.length > 0) {
    try {
      payload = JSON.parse(trimmed)
    } catch {
      // ignore parse errors, treat as no change
    }
  }

  if (payload.changed) {
    const addResult = spawnSync('git', ['add', ...versionFiles], {
      cwd: repoRoot,
      stdio: 'inherit'
    })
    if (addResult.status !== 0) {
      console.error('[prepare-commit-msg] Failed to stage version files.')
      process.exit(addResult.status ?? 1)
    }
  }
}
