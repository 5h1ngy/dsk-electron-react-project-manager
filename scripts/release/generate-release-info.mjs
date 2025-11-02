#!/usr/bin/env node

/* eslint-disable @typescript-eslint/explicit-function-return-type */

import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const envPath = path.resolve('.env')
let appVersion = ''

try {
  const envContents = fs.readFileSync(envPath, 'utf8')
  const match = envContents.match(/^APP_VERSION=(.+)$/m)
  if (!match) {
    throw new Error('APP_VERSION entry missing in .env')
  }
  appVersion = match[1].trim()
} catch (error) {
  console.error(`[release-info] Unable to read .env: ${(error ?? '').message ?? error}`)
  process.exit(1)
}

const run = (command) =>
  execSync(command, {
    stdio: ['ignore', 'pipe', 'ignore']
  })
    .toString()
    .trim()

let previousTag = ''
try {
  previousTag = run('git describe --tags --abbrev=0')
} catch {
  previousTag = ''
}

const range = previousTag ? `${previousTag}..HEAD` : ''
const logFormat = '%s%n%b%n===END==='
const gitLogCommand = `git log ${range} --no-merges --pretty=format:${logFormat}`
let rawLog = ''
try {
  rawLog = run(gitLogCommand)
} catch {
  rawLog = ''
}

const entries = rawLog
  .split('===END===')
  .map((entry) => entry.trim())
  .filter(Boolean)

const notes = entries.map((entry) => {
  const [firstLine, ...rest] = entry.split('\n')
  const subject = firstLine.trim()
  const body = rest.join('\n')

  if (/BREAKING CHANGE/i.test(body) || subject.includes('!')) {
    return `-  ${subject}`
  }
  return `- ${subject}`
})

const releaseNotes = notes.length > 0 ? notes.join('\n') : '- Maintenance updates'

if (!process.env.GITHUB_OUTPUT) {
  console.log(
    JSON.stringify({
      version: appVersion,
      notes: releaseNotes
    })
  )
  process.exit(0)
}

fs.appendFileSync(
  process.env.GITHUB_OUTPUT,
  `version=${appVersion}\nnotes<<EOF\n${releaseNotes}\nEOF\n`
)
