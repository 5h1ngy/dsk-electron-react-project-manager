#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const args = process.argv.slice(2)

const getArgValue = (flag) => {
  const index = args.indexOf(flag)
  if (index === -1 || index === args.length - 1) {
    return undefined
  }
  return args[index + 1]
}

const cwd = process.cwd()
const branchArg = getArgValue('--branch') ?? process.env.SOURCE_BRANCH ?? process.env.BRANCH_NAME
const targetBranch =
  getArgValue('--target') ?? process.env.TARGET_BRANCH ?? process.env.BASE_BRANCH ?? ''
const dryRun = args.includes('--dry-run')

if (!branchArg) {
  console.error('[version] Missing source branch name. Provide with --branch.')
  process.exit(1)
}

const branchName = branchArg.trim()
const branchKey = branchName.toLowerCase()

const ruleSets = [
  { type: 'feature', prefixes: ['feature/', 'feat/'] },
  { type: 'bugfix', prefixes: ['bugfix/', 'bug/', 'fix/'] },
  { type: 'hotfix', prefixes: ['hotfix/'] },
  { type: 'release', prefixes: ['release/'] }
]

const neutralPrefixes = [
  'chore/',
  'ci/',
  'docs/',
  'build/',
  'refactor/',
  'perf/',
  'style/',
  'test/',
  'revert/'
]

const matchedRule = ruleSets.find((set) => set.prefixes.some((prefix) => branchKey.startsWith(prefix)))

const neutralMatch = neutralPrefixes.some((prefix) => branchKey.startsWith(prefix))

if (!matchedRule && neutralMatch) {
  console.log(
    JSON.stringify({
      branch: branchName,
      targetBranch,
      currentVersion: null,
      nextVersion: null,
      bumpType: 'none',
      changed: false,
      reason: 'Neutral branch prefix; version unchanged.'
    })
  )
  process.exit(0)
}

if (!matchedRule) {
  console.error(
    `[version] Unsupported branch "${branchName}". Expected prefixes: ${[
      ...ruleSets.flatMap((set) => set.prefixes),
      ...neutralPrefixes
    ]
      .map((item) => `"${item}"`)
      .join(', ')}.`
  )
  process.exit(1)
}

const rule = matchedRule

const ensureTargetCompatibility = () => {
  if (!targetBranch) {
    return
  }

  const policy = new Map([
    [
      'main',
      {
        allowed: ['release', 'hotfix'],
        message: 'Only release/* or hotfix/* branches can be merged into main.'
      }
    ],
    [
      'develop',
      {
        allowed: ['feature', 'bugfix'],
        message: 'Only feature/* or bugfix/* branches can be merged into develop.'
      }
    ]
  ])

  const ruleForTarget = policy.get(targetBranch)

  if (!ruleForTarget) {
    return
  }

  if (!ruleForTarget.allowed.includes(rule.type)) {
    console.error(`[version] Merge policy violation: ${ruleForTarget.message}`)
    process.exit(1)
  }
}

ensureTargetCompatibility()

const loadJson = (relativePath) => {
  const filePath = resolve(cwd, relativePath)
  const raw = readFileSync(filePath, 'utf8')
  return { filePath, data: JSON.parse(raw), raw }
}

const currentPackage = loadJson('package.json')
const currentVersion = currentPackage.data.version

const parseVersion = (version) => {
  const parts = version.split('.').map((value) => Number.parseInt(value, 10))
  if (parts.length !== 3 || parts.some((value) => Number.isNaN(value) || value < 0)) {
    throw new Error(`[version] Invalid semantic version: "${version}"`)
  }
  return parts
}

const formatVersion = ([major, minor, patch]) => `${major}.${minor}.${patch}`

const bumpVersion = (versionParts, type) => {
  const [major, minor, patch] = versionParts
  switch (type) {
    case 'feature':
      return [major, minor + 1, 1]
    case 'bugfix':
    case 'hotfix':
      return [major, minor, patch + 1]
    case 'release':
      return [major + 1, minor, patch]
    default:
      throw new Error(`[version] Unsupported bump type: ${type}`)
  }
}

const currentParts = parseVersion(currentVersion)
const nextParts = bumpVersion(currentParts, rule.type)
const nextVersion = formatVersion(nextParts)

if (nextVersion === currentVersion) {
  console.log(
    JSON.stringify({
      branch: branchName,
      targetBranch,
      currentVersion,
      nextVersion,
      changed: false,
      reason: 'Version unchanged.'
    })
  )
  process.exit(0)
}

const updatePackageJson = () => {
  currentPackage.data.version = nextVersion
  writeFileSync(currentPackage.filePath, `${JSON.stringify(currentPackage.data, null, 2)}\n`, 'utf8')
}

const updatePackageLock = () => {
  const lock = loadJson('package-lock.json')
  lock.data.version = nextVersion
  if (lock.data.packages?.['']) {
    lock.data.packages[''].version = nextVersion
  }
  writeFileSync(lock.filePath, `${JSON.stringify(lock.data, null, 2)}\n`, 'utf8')
}

const updateEnvFile = () => {
  const envPath = resolve(cwd, '.env')
  const raw = readFileSync(envPath, 'utf8')
  const updated = raw.replace(
    /^APP_VERSION=.*$/m,
    (line) => (line ? `APP_VERSION=${nextVersion}` : line)
  )
  if (!/^APP_VERSION=/m.test(raw)) {
    throw new Error('[version] APP_VERSION entry is missing in .env')
  }
  writeFileSync(envPath, updated, 'utf8')
}

const updateReadme = () => {
  const readmePath = resolve(cwd, 'README.md')
  const raw = readFileSync(readmePath, 'utf8')
  const updated = raw.replace(
    /> Release \d+\.\d+\.\d+ -/,
    `> Release ${nextVersion} -`
  )
  writeFileSync(readmePath, updated, 'utf8')
}

const updates = [
  updatePackageJson,
  updatePackageLock,
  updateEnvFile,
  updateReadme
]

if (!dryRun) {
  for (const action of updates) {
    action()
  }
}

console.log(
  JSON.stringify({
    branch: branchName,
    targetBranch,
    currentVersion,
    nextVersion,
    bumpType: rule.type,
    changed: !dryRun
  })
)
