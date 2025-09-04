import { existsSync } from 'node:fs'
import { join } from 'node:path'
import dotenv from 'dotenv'

const rootEnvPath = join(process.cwd(), '.env')

if (existsSync(rootEnvPath)) {
  dotenv.config({ path: rootEnvPath })
}

const toBoolean = (value: string | undefined, fallback: boolean): boolean => {
  if (value === undefined) {
    return fallback
  }
  const normalized = value.trim().toLowerCase()
  return ['1', 'true', 'yes', 'on'].includes(normalized)
}

export const env = {
  seedDevData: toBoolean(process.env.SEED_DEV_DATA, process.env.NODE_ENV === 'development')
}

export type Env = typeof env
