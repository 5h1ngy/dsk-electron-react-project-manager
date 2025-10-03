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
import { gzip as gzipCallback, gunzip as gunzipCallback } from 'zlib'
import sqlite3 from 'sqlite3'
import type { App } from 'electron'

import type { AuthService } from '@main/services/auth'
import type { AuditService } from '@main/services/audit'
import type { ServiceActor } from '@main/services/types'
import type {
  DatabaseOperation,
  DatabaseOperationContext,
  DatabaseProgressPhase,
  DatabaseProgressUpdate
} from '@main/services/databaseMaintenance/types'
import { AppError, wrapError } from '@main/config/appError'
import { logger } from '@main/config/logger'

const scrypt = promisify(scryptCallback)
const gzip = promisify(gzipCallback)
const gunzip = promisify(gunzipCallback)

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

const SQLITE_READONLY = sqlite3.OPEN_READONLY
const SQLITE_CREATE = sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE

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

class ProgressReporter {
  private lastPercent = 0

  constructor(
    private readonly operation: DatabaseOperation,
    private readonly context: DatabaseOperationContext
  ) {}

  emit(
    phase: DatabaseProgressPhase,
    percent: number,
    detail?: string,
    counts?: { current?: number; total?: number }
  ): void {
    if (!this.context.onProgress) {
      return
    }
    const clamped = Math.max(0, Math.min(100, percent))
    this.lastPercent = clamped
    this.context.onProgress({
      operation: this.operation,
      operationId: this.context.operationId,
      phase,
      percent: Number.isFinite(clamped) ? Number(clamped.toFixed(2)) : clamped,
      detail,
      current: counts?.current,
      total: counts?.total
    })
  }

  getPercent(): number {
    return this.lastPercent
  }
}

const openDatabase = async (path: string, mode: number): Promise<sqlite3.Database> =>
  await new Promise<sqlite3.Database>((resolve, reject) => {
    const database = new sqlite3.Database(path, mode, (error) => {
      if (error) {
        reject(error)
        return
      }
      resolve(database)
    })
  })

const closeDatabase = async (database: sqlite3.Database): Promise<void> =>
  await new Promise<void>((resolve, reject) => {
    database.close((error) => {
      if (error) {
        reject(error)
        return
      }
      resolve()
    })
  })

const runStatement = async (
  database: sqlite3.Database,
  sql: string,
  params: unknown[] = []
): Promise<void> =>
  await new Promise<void>((resolve, reject) => {
    database.run(sql, params, function (error) {
      if (error) {
        reject(error)
        return
      }
      resolve()
    })
  })

const allStatements = async <T = unknown>(
  database: sqlite3.Database,
  sql: string,
  params: unknown[] = []
): Promise<T[]> =>
  await new Promise<T[]>((resolve, reject) => {
    database.all(sql, params, (error, rows) => {
      if (error) {
        reject(error)
        return
      }
      resolve(rows as T[])
    })
  })

const prepareStatement = async (
  database: sqlite3.Database,
  sql: string
): Promise<sqlite3.Statement> =>
  await new Promise<sqlite3.Statement>((resolve, reject) => {
    const statement = database.prepare(sql, (error) => {
      if (error) {
        reject(error)
        return
      }
      resolve(statement)
    })
  })

const runPrepared = async (statement: sqlite3.Statement, params: unknown[]): Promise<void> =>
  await new Promise<void>((resolve, reject) => {
    statement.run(params, function (error) {
      if (error) {
        reject(error)
        return
      }
      resolve()
    })
  })

const finalizePrepared = async (statement: sqlite3.Statement): Promise<void> =>
  await new Promise<void>((resolve, reject) => {
    statement.finalize((error) => {
      if (error) {
        reject(error)
        return
      }
      resolve()
    })
  })

const quoteIdentifier = (identifier: string): string =>
  `"${identifier.replace(/"/g, '""')}"`

const isEncodedBlob = (value: unknown): value is { __type: 'blob'; data: string } =>
  Boolean(
    value &&
      typeof value === 'object' &&
      (value as { __type?: unknown }).__type === 'blob' &&
      typeof (value as { data?: unknown }).data === 'string'
  )

const encodeCell = (value: unknown): unknown => {
  if (Buffer.isBuffer(value)) {
    return {
      __type: 'blob',
      data: value.toString('base64')
    }
  }
  return value ?? null
}

const decodeCell = (value: unknown): unknown => {
  if (isEncodedBlob(value)) {
    return Buffer.from(value.data, 'base64')
  }
  return value
}

interface SchemaEntry {
  name: string
  type: string
  sql: string
}

interface TableSnapshot {
  name: string
  columns: string[]
  rows: unknown[][]
}

interface SequenceEntry {
  name: string
  seq: number
}

interface DatabaseSnapshot {
  metadata: {
    exportedAt: string
    sqliteVersion: string
  }
  schema: SchemaEntry[]
  tables: TableSnapshot[]
  sequences: SequenceEntry[]
}

interface SchemaRow {
  name: string
  type: string
  sql: string | null
}

interface SequenceRow {
  name: string
  seq: number
}

const collectDatabaseSnapshot = async (
  databasePath: string,
  reporter?: ProgressReporter
): Promise<DatabaseSnapshot> => {
  const database = await openDatabase(databasePath, SQLITE_READONLY)
  try {
    await runStatement(database, 'PRAGMA foreign_keys=OFF')

    reporter?.emit('snapshotSchema', 5)

    const schemaRows = await allStatements<SchemaRow>(
      database,
      `SELECT name, type, sql
       FROM sqlite_schema
       WHERE sql IS NOT NULL
         AND name NOT LIKE 'sqlite_%'
       ORDER BY CASE type
         WHEN 'table' THEN 0
         WHEN 'view' THEN 1
         WHEN 'index' THEN 2
         WHEN 'trigger' THEN 3
       ELSE 4
       END, name`
    )

    reporter?.emit('snapshotSchema', 10)

    const schema: SchemaEntry[] = schemaRows
      .filter((row) => !(row.type === 'table' && isFtsAuxiliaryTable(row.name)))
      .map((row) => ({
        name: row.name,
        type: row.type,
        sql: row.sql ?? ''
      }))

    const tables: TableSnapshot[] = []

    const tableSchemas = schema.filter(
      (entry) => entry.type === 'table' && !isFtsAuxiliaryTable(entry.name)
    )
    const totalTables = tableSchemas.length
    let processedTables = 0

    if (totalTables === 0) {
      reporter?.emit('snapshotTable', 45)
    }

    for (const table of tableSchemas) {
      const tableInfo = await allStatements<{ name: string }>(
        database,
        `PRAGMA table_info(${quoteIdentifier(table.name)})`
      )
      const columns = tableInfo.map((info) => info.name)

      let encodedRows: unknown[][] = []

      if (columns.length > 0) {
        const rows = await allStatements<Record<string, unknown>>(
          database,
          `SELECT ${columns.map((column) => quoteIdentifier(column)).join(', ')}
           FROM ${quoteIdentifier(table.name)}`
        )

        encodedRows = rows.map((row) => columns.map((column) => encodeCell(row[column])))
      }

      tables.push({
        name: table.name,
        columns,
        rows: encodedRows
      })

      processedTables += 1
      const percent = 10 + (processedTables / Math.max(totalTables, 1)) * 35
      reporter?.emit('snapshotTable', percent, table.name, {
        current: processedTables,
        total: totalTables
      })
    }

    let sequences: SequenceEntry[] = []
    try {
      const sequenceRows = await allStatements<SequenceRow>(
        database,
        'SELECT name, seq FROM sqlite_sequence'
      )
      sequences = sequenceRows.map((row) => ({
        name: row.name,
        seq: row.seq
      }))
    } catch {
      sequences = []
    }

    reporter?.emit('snapshotSequences', totalTables > 0 ? 55 : 50)

    const [{ version }] = await allStatements<{ version: string }>(
      database,
      'SELECT sqlite_version() AS version'
    )

    const exportedAt = new Date().toISOString()

    return {
      metadata: {
        exportedAt,
        sqliteVersion: version
      },
      schema,
      tables,
      sequences
    }
  } finally {
    await closeDatabase(database)
  }
}

const restoreDatabaseSnapshot = async (
  snapshot: DatabaseSnapshot,
  destinationPath: string,
  reporter?: ProgressReporter
): Promise<void> => {
  const database = await openDatabase(destinationPath, SQLITE_CREATE)

  try {
    await runStatement(database, 'PRAGMA foreign_keys=OFF')
    await runStatement(database, 'BEGIN IMMEDIATE TRANSACTION')

    const tableSchemas = snapshot.schema.filter((entry) => entry.type === 'table')
    for (const entry of tableSchemas) {
      await runStatement(database, entry.sql)
    }

    reporter?.emit('restoreSchema', 60)

    const totalTables = snapshot.tables.length
    let processedTables = 0

    if (totalTables === 0) {
      reporter?.emit('restoreTable', 85)
    }

    for (const table of snapshot.tables) {
      if (table.columns.length === 0 || table.rows.length === 0) {
        processedTables += 1
        const percent =
          60 + (processedTables / Math.max(totalTables, 1)) * 30
        reporter?.emit('restoreTable', percent, table.name, {
          current: processedTables,
          total: totalTables
        })
        continue
      }

      const columnList = table.columns.map((column) => quoteIdentifier(column)).join(', ')
      const placeholders = table.columns.map(() => '?').join(', ')
      const statement = await prepareStatement(
        database,
        `INSERT INTO ${quoteIdentifier(table.name)} (${columnList}) VALUES (${placeholders})`
      )
      try {
        for (const row of table.rows) {
          const decodedValues = row.map((value) => decodeCell(value))
          await runPrepared(statement, decodedValues)
        }
      } finally {
        await finalizePrepared(statement)
      }

      processedTables += 1
      const percent =
        60 + (processedTables / Math.max(totalTables, 1)) * 30
      reporter?.emit('restoreTable', percent, table.name, {
        current: processedTables,
        total: totalTables
      })
    }

    const nonTableSchemas = snapshot.schema.filter((entry) => entry.type !== 'table')
    for (const entry of nonTableSchemas) {
      await runStatement(database, entry.sql)
    }

    reporter?.emit('restoreIndexes', 92)

    for (const sequence of snapshot.sequences ?? []) {
      try {
        await runStatement(database, 'DELETE FROM sqlite_sequence WHERE name = ?', [sequence.name])
        await runStatement(database, 'INSERT INTO sqlite_sequence(name, seq) VALUES (?, ?)', [
          sequence.name,
          sequence.seq
        ])
      } catch {
        /* ignore if sqlite_sequence is not present */
      }
    }

    reporter?.emit('restoreSequences', 96)

    await runStatement(database, 'COMMIT')
    await runStatement(database, 'PRAGMA foreign_keys=ON')

    reporter?.emit('finalize', 98)
  } catch (error) {
    try {
      await runStatement(database, 'ROLLBACK')
    } catch {
      /* ignore rollback errors */
    }
    throw error
  } finally {
    await closeDatabase(database)
  }
}

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

  async exportEncryptedDatabase(
    token: string,
    password: string,
    destinationPath: string,
    context: DatabaseOperationContext
  ): Promise<void> {
    const actor = await this.resolveAdminActor(token)
    const normalizedPassword = this.ensurePassword(password)
    const databasePath = await this.getDatabasePath()
    const reporter = new ProgressReporter('export', context)

    reporter.emit('prepare', 0)

    try {
      await stat(databasePath)
    } catch {
      throw new AppError('ERR_INTERNAL', 'File di database non trovato')
    }

    try {
      const snapshot = await collectDatabaseSnapshot(databasePath, reporter)
      reporter.emit('serialize', 60)
      const snapshotBuffer = Buffer.from(JSON.stringify(snapshot), 'utf-8')

      reporter.emit('compress', 70)
      const compressed = await gzip(snapshotBuffer)
      const salt = randomBytes(SALT_LENGTH)
      const key = await deriveKey(normalizedPassword, salt)
      const iv = randomBytes(IV_LENGTH)
      const cipher = createCipheriv('aes-256-gcm', key, iv)

      reporter.emit('encrypt', 82)
      const encrypted = Buffer.concat([cipher.update(compressed), cipher.final()])
      const authTag = cipher.getAuthTag()
      const header = buildHeader(salt, iv, authTag)

      await mkdir(dirname(destinationPath), { recursive: true })

      reporter.emit('write', 95)
      await writeFile(destinationPath, Buffer.concat([header, encrypted]), { mode: 0o600 })

      reporter.emit('complete', 100)

      await this.auditService.record(actor.userId, 'database', 'primary', 'export', {
        destinationPath,
        bytes: snapshotBuffer.length
      })
      this.log.success(`Database esportato in ${destinationPath}`, 'Database')
    } catch (error) {
      throw wrapError(error)
    }
  }

  async importEncryptedDatabase(
    token: string,
    password: string,
    sourcePath: string,
    context: DatabaseOperationContext
  ): Promise<void> {
    const actor = await this.resolveAdminActor(token)
    const normalizedPassword = this.ensurePassword(password)
    const databasePath = await this.getDatabasePath()
    this.restartPending = false
    const reporter = new ProgressReporter('import', context)

    reporter.emit('prepare', 0)

    let ciphertext: Buffer
    try {
      ciphertext = await readFile(sourcePath)
    } catch (error) {
      throw wrapError(error)
    }

    const { salt, iv, authTag } = parseHeader(ciphertext)
    const payload = ciphertext.subarray(HEADER_LENGTH)

    let decompressed: Buffer
    try {
      const key = await deriveKey(normalizedPassword, salt)
      const decipher = createDecipheriv('aes-256-gcm', key, iv)
      decipher.setAuthTag(authTag)
      reporter.emit('decrypt', 20)
      const compressed = Buffer.concat([decipher.update(payload), decipher.final()])
      reporter.emit('decrypt', 25)
      decompressed = await gunzip(compressed)
      reporter.emit('decompress', 30)
    } catch (error) {
      throw new AppError(
        'ERR_PERMISSION',
        'Password non valida o file di backup corrotto',
        { cause: error }
      )
    }

    let snapshot: DatabaseSnapshot
   try {
     snapshot = JSON.parse(decompressed.toString('utf-8')) as DatabaseSnapshot
      reporter.emit('parse', 35)
   } catch (error) {
     throw new AppError('ERR_VALIDATION', 'Contenuto del backup non valido', { cause: error })
   }

    const tempPath = `${databasePath}.import-${randomUUID()}`

    try {
      await mkdir(dirname(databasePath), { recursive: true })
      reporter.emit('restoreSchema', 55)
      await restoreDatabaseSnapshot(snapshot, tempPath, reporter)
      await this.storage.teardownDatabase()
      await rm(databasePath, { force: true })
      await rename(tempPath, databasePath)

      try {
        await this.auditService.record(actor.userId, 'database', 'primary', 'import', {
          sourcePath,
          bytes: decompressed.length
        })
      } catch (auditError) {
        this.log.warn('Impossibile registrare audit dopo import database', 'Database')
        const detail =
          auditError instanceof Error ? auditError.stack ?? auditError.message : String(auditError)
        this.log.debug(detail, 'Database')
      }
      this.restartPending = true
      this.log.success('Database importato con successo. Riavvio richiesto.', 'Database')
      reporter.emit('complete', 100)
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
const FTS_AUXILIARY_SUFFIXES = [
  '_fts_config',
  '_fts_data',
  '_fts_idx',
  '_fts_docsize',
  '_fts_content',
  '_fts_segments',
  '_fts_segdir',
  '_fts_stat'
]

const isFtsAuxiliaryTable = (name: string): boolean =>
  FTS_AUXILIARY_SUFFIXES.some((suffix) => name.endsWith(suffix))
