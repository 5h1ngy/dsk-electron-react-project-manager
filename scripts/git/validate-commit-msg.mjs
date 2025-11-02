#!/usr/bin/env node

/* eslint-disable @typescript-eslint/explicit-function-return-type */

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const COMMIT_MSG_PATH = process.argv[2]

if (!COMMIT_MSG_PATH) {
  console.error('[commit-msg] Missing commit message file path.')
  process.exit(1)
}

const allowedTypes = [
  'build',
  'chore',
  'ci',
  'docs',
  'feat',
  'fix',
  'hotfix',
  'perf',
  'refactor',
  'release',
  'revert',
  'style',
  'test'
]

const readMessage = (filePath) => {
  try {
    return readFileSync(resolve(filePath), 'utf8')
  } catch (error) {
    console.error(
      `[commit-msg] Unable to read commit message file: ${(error ?? '').message ?? error}`
    )
    process.exit(1)
  }
}

const rawMessage = readMessage(COMMIT_MSG_PATH)
const firstLine = rawMessage.split(/\r?\n/)[0]?.trim() ?? ''

if (firstLine.length === 0) {
  console.error('[commit-msg] Commit message cannot be empty.')
  process.exit(1)
}

if (firstLine.startsWith('Merge ')) {
  process.exit(0)
}

const typesPattern = allowedTypes.join('|')
const conventionalRegex = new RegExp(
  `^(?<type>${typesPattern})(\\([\\w\\-.]+\\))?(?<breaking>!)?: (?<subject>[^\\s].*)$`
)

const match = conventionalRegex.exec(firstLine)

if (!match) {
  console.error(
    `[commit-msg] Invalid commit message: "${firstLine}". Expected format is "<type>(<scope>)?: <description>" with one of [${allowedTypes.join(
      ', '
    )}].`
  )
  process.exit(1)
}

const { type, subject } = match.groups ?? {}

if (!subject || subject.trim().length === 0) {
  console.error('[commit-msg] Commit message subject must not be empty.')
  process.exit(1)
}

if (type === 'release' && !/^v?\d+\.\d+\.\d+/.test(subject)) {
  console.error(
    '[commit-msg] Release commits should reference the version (e.g., "release: v1.2.3").'
  )
  process.exit(1)
}
