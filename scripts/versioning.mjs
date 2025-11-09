#!/usr/bin/env node

/* eslint-disable @typescript-eslint/explicit-function-return-type */

import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { execSync } from 'node:child_process'
import readline from 'node:readline'

const PROJECT_ROOT = process.cwd()
const ENV_DIR = resolve(PROJECT_ROOT, 'env')

const collectEnvFiles = () => {
  try {
    return readdirSync(ENV_DIR, { withFileTypes: true })
      .filter((entry) => entry.isFile() && entry.name.startsWith('.env'))
      .map((entry) => ({
        relative: `env/${entry.name}`,
        absolute: resolve(ENV_DIR, entry.name)
      }))
  } catch {
    return []
  }
}

const ENV_FILES = collectEnvFiles()
const VERSION_FILES = ['package.json', 'package-lock.json', 'README.md', ...ENV_FILES.map((file) => file.relative)]
const args = process.argv.slice(2)

const getCliVersion = () => {
  const idx = args.findIndex((value) => value === '--version' || value === '-v')
  if (idx === -1) {
    return undefined
  }
  if (idx === args.length - 1) {
    console.error('[version] Missing value after --version flag.')
    process.exit(1)
  }
  return args[idx + 1].trim()
}

const question = (prompt) =>
  new Promise((resolveAnswer) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })
    rl.question(prompt, (answer) => {
      rl.close()
      resolveAnswer(answer.trim())
    })
  })

const ensureCleanTree = () => {
  const status = execSync('git status --porcelain', { cwd: PROJECT_ROOT }).toString().trim()
  if (status) {
    console.error(
      '[version] Working tree not clean. Commit or stash changes before running the bump script.'
    )
    process.exit(1)
  }
}

const readJson = (relativePath) => {
  const filePath = resolve(PROJECT_ROOT, relativePath)
  const raw = readFileSync(filePath, 'utf8')
  return { filePath, data: JSON.parse(raw) }
}

const writeJson = (filePath, data) => {
  writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8')
}

const updatePackageJson = (version) => {
  const pkg = readJson('package.json')
  pkg.data.version = version
  writeJson(pkg.filePath, pkg.data)
}

const updatePackageLock = (version) => {
  const lock = readJson('package-lock.json')
  lock.data.version = version
  if (lock.data.packages?.['']) {
    lock.data.packages[''].version = version
  }
  writeJson(lock.filePath, lock.data)
}

const updateEnvFiles = (version) => {
  if (ENV_FILES.length === 0) {
    throw new Error('No env files found under env/. Cannot update APP_VERSION entries.')
  }

  ENV_FILES.forEach(({ absolute, relative }) => {
    const raw = readFileSync(absolute, 'utf8')
    if (!/^APP_VERSION=/m.test(raw)) {
      throw new Error(`APP_VERSION entry is missing in ${relative}`)
    }
    const next = raw.replace(/^APP_VERSION=.*$/m, `APP_VERSION=${version}`)
    writeFileSync(absolute, next, 'utf8')
  })
}

const updateReadme = (version) => {
  const readmePath = resolve(PROJECT_ROOT, 'README.md')
  const raw = readFileSync(readmePath, 'utf8')
  if (!/version-\d+\.\d+\.\d+-/m.test(raw)) {
    throw new Error('Unable to locate the version badge in README.md')
  }
  const next = raw.replace(/version-\d+\.\d+\.\d+-/g, `version-${version}-`)
  writeFileSync(readmePath, next, 'utf8')
}

const validateSemver = (value) => /^\d+\.\d+\.\d+$/.test(value)

const getCurrentVersion = () => {
  const pkg = readJson('package.json')
  return pkg.data.version
}

const stageFiles = () => {
  execSync(`git add ${VERSION_FILES.join(' ')}`, {
    cwd: PROJECT_ROOT,
    stdio: 'inherit'
  })
}

const commitVersion = (version) => {
  execSync(`git commit -m "chore: bump version to ${version}"`, {
    cwd: PROJECT_ROOT,
    stdio: 'inherit'
  })
}

const main = async () => {
  ensureCleanTree()

  const currentVersion = getCurrentVersion()
  console.log(`[version] Current version: ${currentVersion}`)

  const provided = getCliVersion()
  const input = provided ?? (await question('Enter the new version (x.y.z): '))
  if (!validateSemver(input)) {
    console.error('[version] Invalid semantic version. Expected format x.y.z (e.g., 1.2.3)')
    process.exit(1)
  }

  if (input === currentVersion) {
    console.error('[version] New version matches the current version. Nothing to do.')
    process.exit(1)
  }

  updatePackageJson(input)
  updatePackageLock(input)
  updateEnvFiles(input)
  updateReadme(input)

  stageFiles()
  commitVersion(input)

  console.log(`[version] Bumped project version to ${input} and created commit.`)
}

main().catch((error) => {
  console.error('[version] Failed to bump version:', error.message ?? error)
  process.exit(1)
})
