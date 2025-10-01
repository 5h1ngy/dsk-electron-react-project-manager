#!/usr/bin/env node

import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const pkgPath = path.resolve('package.json')
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
const currentVersion = pkg.version

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

let bump = 'patch'

const notes = entries.map((entry) => {
  const [firstLine, ...rest] = entry.split('\n')
  const subject = firstLine.trim()
  const body = rest.join('\n')

  if (subject.includes('!') || /BREAKING CHANGE/i.test(body)) {
    bump = 'major'
  } else if (bump !== 'major' && /^feat(\(|:)/i.test(subject)) {
    bump = 'minor'
  } else if (bump === 'patch' && /^fix(\(|:)/i.test(subject)) {
    bump = 'patch'
  }

  return `- ${subject}`
})

const [major, minor, patch] = currentVersion.split('.').map(Number)

let nextVersion = currentVersion
if (bump === 'major') {
  nextVersion = `${major + 1}.0.0`
} else if (bump === 'minor') {
  nextVersion = `${major}.${minor + 1}.0`
} else {
  nextVersion = `${major}.${minor}.${patch + 1}`
}

const releaseNotes = notes.length > 0 ? notes.join('\n') : '- Maintenance updates'

if (!process.env.GITHUB_OUTPUT) {
  console.log(
    JSON.stringify({
      version: nextVersion,
      notes: releaseNotes
    })
  )
  process.exit(0)
}

fs.appendFileSync(
  process.env.GITHUB_OUTPUT,
  `version=${nextVersion}\nnotes<<EOF\n${releaseNotes}\nEOF\n`
)
