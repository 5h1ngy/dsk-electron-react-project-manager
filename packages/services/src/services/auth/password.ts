import { randomBytes } from 'node:crypto'
import { hash, verify } from '@node-rs/argon2'

const ARGON2_OPTIONS = {
  algorithm: 2,
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1
} as const

export const hashPassword = async (password: string): Promise<string> => {
  return await hash(password, {
    ...ARGON2_OPTIONS,
    salt: randomBytes(16)
  })
}

export const verifyPassword = async (hashValue: string, password: string): Promise<boolean> => {
  try {
    return await verify(hashValue, password, ARGON2_OPTIONS)
  } catch {
    return false
  }
}
