#!/usr/bin/env node

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const expected = process.env.EXPECTED_VERSION

if (!expected) {
  console.error('EXPECTED_VERSION env variable is required')
  process.exit(1)
}

const pkg = JSON.parse(readFileSync(resolve('package.json'), 'utf8'))
const envFile = readFileSync(resolve('.env'), 'utf8')
const match = envFile.match(/^APP_VERSION=(.+)$/m)

if (!match) {
  console.error('APP_VERSION missing in .env')
  process.exit(1)
}

if (pkg.version !== expected) {
  console.error(`package.json version ${pkg.version} does not match expected ${expected}`)
  process.exit(1)
}

const envVersion = match[1].trim()
if (envVersion !== expected) {
  console.error(`.env APP_VERSION ${envVersion} does not match expected ${expected}`)
  process.exit(1)
}

console.log(`Versions aligned at ${expected}`)
