import { randomUUID } from 'node:crypto'
import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scrypt as scryptCallback
} from 'node:crypto'
import { mkdir, readFile, rename, rm, stat, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import { promisify } from 'node:util'
import type { App } from 'electron'

import type { AuthService } from '@main/services/auth'
import type { AuditService } from '@main/services/audit'
import type { ServiceActor } from '@main/services/types'
import { AppError, wrapError } from '@main/config/appError'
import { logger } from '@main/config/logger'

const scrypt = promisify(scryptCallback)

/**
 * File layout:
 * [8 byte magic][1 byte version][16 byte salt][12 byte iv][16 byte authTag][ciphertext...]
 * The symmetric key is derived with scrypt (N=2^15, r=8, p=1) and AES-256-GCM is used for
 * authenticated encryption of the SQLite payload.
 */
const MAGIC_HEADER = Buffer.from('DSKDBEX1', 'utf8')
const FORMAT_VERSION = 1
const SALT_LENGTH = 16
const IV_LENGTH = 12
const TAG_LENGTH = 16
const KEY_LENGTH = 32
const HEADER_LENGTH = MAGIC_HEADER.length + 1 + SALT_LENGTH + IV_LENGTH + TAG_LENGTH
const MIN_PASSWORD_LENGTH = 12

const SCRYPT_PARAMS = Object.freeze({
  N: 2 ** 15,
  r: 8,
  p: 1,
  maxmem: 64 * 1024 * 1024
})

interface StorageController {
  getDatabasePath(): string | null
  teardownDatabase(): Promise<void>
}

interface DatabaseMaintenanceDependencies {
  authService: AuthService
  auditService: AuditService
  app: App
  storage: StorageController
  log?: typeof logger
}

const normalizePassword = (password: string): string => password.normalize('NFKC')

const deriveKey = async (password: string, salt: Buffer): Promise<Buffer> => {
  const key = await scrypt(password, salt, KEY_LENGTH, SCRYPT_PARAMS)
  if (!Buffer.isBuffer(key)) {
    return Buffer.from(key as Uint8Array)
  }
  return key
}

const buildHeader = (salt: Buffer, iv: Buffer, authTag: Buffer): Buffer => {
  const header = Buffer.alloc(HEADER_LENGTH)
  let offset = 0
  MAGIC_HEADER.copy(header, offset)
  offset += MAGIC_HEADER.length
  header.writeUInt8(FORMAT_VERSION, offset)
  offset += 1
  salt.copy(header, offset)
  offset += SALT_LENGTH
  iv.copy(header, offset)
  offset += IV_LENGTH
  authTag.copy(header, offset)
  return header
}

const parseHeader = (buffer: Buffer) => {
  if (buffer.length < HEADER_LENGTH) {
    throw new AppError('ERR_VALIDATION', 'Formato file di backup non valido')
  }

  const magic = buffer.subarray(0, MAGIC_HEADER.length)
  if (!magic.equals(MAGIC_HEADER)) {
    throw new AppError('ERR_VALIDATION', 'Intestazione file non riconosciuta')
  }

  const versionOffset = MAGIC_HEADER.length
  const version = buffer.readUInt8(versionOffset)
  if (version !== FORMAT_VERSION) {
    throw new AppError('ERR_VALIDATION', `Versione formato non supportata (${version})`)
  }

  const saltOffset = versionOffset + 1
  const ivOffset = saltOffset + SALT_LENGTH
  const tagOffset = ivOffset + IV_LENGTH

  return {
    salt: buffer.subarray(saltOffset, saltOffset + SALT_LENGTH),
    iv: buffer.subarray(ivOffset, ivOffset + IV_LENGTH),
    authTag: buffer.subarray(tagOffset, tagOffset + TAG_LENGTH)
  }
}

export class DatabaseMaintenanceService {
  private readonly authService: AuthService
  private readonly auditService: AuditService
  private readonly app: App
  private readonly storage: StorageController
  private readonly log: typeof logger
  private restartPending = false

  constructor(dependencies: DatabaseMaintenanceDependencies) {
    this.authService = dependencies.authService
    this.auditService = dependencies.auditService
    this.app = dependencies.app
    this.storage = dependencies.storage
    this.log = dependencies.log ?? logger
  }

  private async resolveAdminActor(token: string): Promise<ServiceActor> {
    const actor = await this.authService.resolveActor(token, { touch: true })
    if (!actor.roles.includes('Admin')) {
      throw new AppError('ERR_PERMISSION', 'Operazione consentita solo agli amministratori')
    }
    return actor
  }

  private async getDatabasePath(): Promise<string> {
    const path = this.storage.getDatabasePath()
    if (!path) {
      throw new AppError('ERR_INTERNAL', 'Percorso database non disponibile')
    }
    return path
  }

  private ensurePassword(password: string): string {
    const normalized = normalizePassword(password.trim())
    if (normalized.length < MIN_PASSWORD_LENGTH) {
      throw new AppError(
        'ERR_VALIDATION',
        `La password deve contenere almeno ${MIN_PASSWORD_LENGTH} caratteri`
      )
    }
    return normalized
  }

  async exportEncryptedDatabase(token: string, password: string, destinationPath: string): Promise<void> {
    const actor = await this.resolveAdminActor(token)
    const normalizedPassword = this.ensurePassword(password)
    const databasePath = await this.getDatabasePath()

    try {
      await stat(databasePath)
    } catch {
      throw new AppError('ERR_INTERNAL', 'File di database non trovato')
    }

    try {
      const plaintext = await readFile(databasePath)
      const salt = randomBytes(SALT_LENGTH)
      const key = await deriveKey(normalizedPassword, salt)
      const iv = randomBytes(IV_LENGTH)
      const cipher = createCipheriv('aes-256-gcm', key, iv)
      const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()])
      const authTag = cipher.getAuthTag()
      const header = buildHeader(salt, iv, authTag)

      await mkdir(dirname(destinationPath), { recursive: true })
      await writeFile(destinationPath, Buffer.concat([header, encrypted]), { mode: 0o600 })

      await this.auditService.record(actor.userId, 'database', 'primary', 'export', {
        destinationPath,
        bytes: plaintext.length
      })
      this.log.success(`Database esportato in ${destinationPath}`, 'Database')
    } catch (error) {
      throw wrapError(error)
    }
  }

  async importEncryptedDatabase(
    token: string,
    password: string,
    sourcePath: string
  ): Promise<void> {
    const actor = await this.resolveAdminActor(token)
    const normalizedPassword = this.ensurePassword(password)
    const databasePath = await this.getDatabasePath()

    let ciphertext: Buffer
    try {
      ciphertext = await readFile(sourcePath)
    } catch (error) {
      throw wrapError(error)
    }

    const { salt, iv, authTag } = parseHeader(ciphertext)
    const payload = ciphertext.subarray(HEADER_LENGTH)

    let plaintext: Buffer
    try {
      const key = await deriveKey(normalizedPassword, salt)
      const decipher = createDecipheriv('aes-256-gcm', key, iv)
      decipher.setAuthTag(authTag)
      plaintext = Buffer.concat([decipher.update(payload), decipher.final()])
    } catch (error) {
      throw new AppError(
        'ERR_PERMISSION',
        'Password non valida o file di backup corrotto',
        { cause: error }
      )
    }

    const tempPath = `${databasePath}.import-${randomUUID()}`

    try {
      await mkdir(dirname(databasePath), { recursive: true })
      await writeFile(tempPath, plaintext, { mode: 0o600 })
      await this.storage.teardownDatabase()
      await rm(databasePath, { force: true })
      await rename(tempPath, databasePath)

      try {
        await this.auditService.record(actor.userId, 'database', 'primary', 'import', {
          sourcePath,
          bytes: plaintext.length
        })
      } catch (auditError) {
        this.log.warn('Impossibile registrare audit dopo import database', 'Database')
        const detail =
          auditError instanceof Error ? auditError.stack ?? auditError.message : String(auditError)
        this.log.debug(detail, 'Database')
      }
      this.restartPending = true
      this.log.success('Database importato con successo. Riavvio richiesto.', 'Database')
    } catch (error) {
      try {
        await rm(tempPath, { force: true })
      } catch {
        /* noop */
      }
      throw wrapError(error)
    }
  }

  hasPendingRestart(): boolean {
    return this.restartPending
  }

  async restartApplication(token: string): Promise<void> {
    await this.resolveAdminActor(token)
    if (!this.restartPending) {
      throw new AppError('ERR_INTERNAL', 'Nessun riavvio del database in attesa')
    }

    try {
      this.restartPending = false
      this.log.info("Applicazione in riavvio su richiesta dell'utente", 'Database')
      this.app.relaunch()
      this.app.exit(0)
    } catch (error) {
      this.restartPending = true
      throw wrapError(error)
    }
  }
}
