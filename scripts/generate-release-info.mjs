#!/usr/bin/env node

/* eslint-disable @typescript-eslint/explicit-function-return-type */

import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { execSync } from 'node:child_process'

const PROJECT_ROOT = process.cwd()
const PACKAGE_JSON = resolve(PROJECT_ROOT, 'package.json')
const DESKTOP_ENV_FILE = resolve(PROJECT_ROOT, 'env/.env.desktop.prod')

const readPackageJson = () => {
  try {
    const raw = readFileSync(PACKAGE_JSON, 'utf8')
    return JSON.parse(raw)
  } catch (error) {
    throw new Error(`Unable to read package.json: ${error.message ?? error}`)
  }
}

const formatDescription = (value) => {
  if (!value) return 'Secure offline project manager built with Electron, React, Ant Design, and SQLite.'
  return value.replace(/\s+/g, ' ').trim()
}

const extractAppVersion = () => {
  try {
    const raw = readFileSync(DESKTOP_ENV_FILE, 'utf8')
    const line = raw
      .split('\n')
      .map((entry) => entry.trim())
      .find((entry) => entry.startsWith('APP_VERSION='))

    if (!line) {
      throw new Error('APP_VERSION entry not found in env/.env.desktop.prod')
    }

    const value = line.split('APP_VERSION=')[1]?.trim()
    if (!value) {
      throw new Error('APP_VERSION entry is empty in env/.env.desktop.prod')
    }
    return value
  } catch (error) {
    throw new Error(`Unable to read env/.env.desktop.prod: ${error.message ?? error}`)
  }
}

const getLatestTag = () => {
  try {
    return execSync('git describe --tags --abbrev=0', {
      cwd: PROJECT_ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore']
    })
      .trim()
      .replace(/\s/g, '')
  } catch {
    return undefined
  }
}

const collectCommits = () => {
  const previousTag = getLatestTag()
  const range = previousTag ? `${previousTag}..HEAD` : undefined
  const command = range
    ? `git log ${range} --pretty=format:%s:::%h --no-merges`
    : 'git log -n 20 --pretty=format:%s:::%h --no-merges'

  try {
    const raw = execSync(command, {
      cwd: PROJECT_ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore']
    }).trim()

    if (!raw) {
      return []
    }

    return raw
      .split('\n')
      .map((line) => {
        const [summary, hash] = line.split(':::')
        return {
          summary: summary?.trim(),
          hash: hash?.trim()
        }
      })
      .filter((entry) => entry.summary && entry.hash)
  } catch {
    return []
  }
}

const buildHighlightsSection = () => {
  const commits = collectCommits()
  if (commits.length === 0) {
    return '## Highlights\n\n- Internal maintenance release.'
  }

  const rows = commits
    .map((commit) => `- ${commit.summary} (${commit.hash})`)
    .join('\n')

  return `## Highlights\n\n${rows}`
}

const appendOutput = (key, value) => {
  const outputFile = process.env.GITHUB_OUTPUT
  if (!outputFile) {
    return
  }

  const normalized = typeof value === 'string' ? value : JSON.stringify(value)
  const payload =
    normalized.indexOf('\n') === -1
      ? `${key}=${normalized}\n`
      : `${key}<<EOF\n${normalized}\nEOF\n`

  writeFileSync(outputFile, payload, { flag: 'a' })
}

const run = () => {
  const pkg = readPackageJson()
  const version = extractAppVersion()
  const packageName = pkg.name
  const productName = pkg.productName ?? packageName
  const description = formatDescription(pkg.description)
  const releaseDate = new Date().toISOString().split('T')[0]
  const title = `v${version}`

  const summarySection = [
    '## Summary',
    '',
    `- Package: \`${packageName}\``,
    `- Version: ${version}`,
    `- Released: ${releaseDate}`,
    '',
    `> ${description}`
  ].join('\n')

  const highlightsSection = buildHighlightsSection()
  const notes = [summarySection, highlightsSection].join('\n\n')

  appendOutput('version', version)
  appendOutput('title', title)
  appendOutput('notes', notes)

  console.log(
    JSON.stringify(
      {
        version,
        title,
        notes
      },
      null,
      2
    )
  )
}

run()
