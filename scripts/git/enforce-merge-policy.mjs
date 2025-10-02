#!/usr/bin/env node

import { readFileSync } from 'node:fs'
import { execSync } from 'node:child_process'
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
      allowedPrefixes: ['feature/', 'bugfix/'],
      error:
        'Only branches starting with "feature/" or "bugfix/" can be merged into develop.'
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
