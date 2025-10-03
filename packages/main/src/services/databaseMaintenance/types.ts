export type DatabaseOperation = 'export' | 'import'

export type DatabaseProgressPhase =
  | 'prepare'
  | 'snapshotSchema'
  | 'snapshotTable'
  | 'snapshotSequences'
  | 'serialize'
  | 'compress'
  | 'encrypt'
  | 'write'
  | 'decrypt'
  | 'decompress'
  | 'parse'
  | 'restoreSchema'
  | 'restoreTable'
  | 'restoreIndexes'
  | 'restoreSequences'
  | 'finalize'
  | 'complete'

export interface DatabaseProgressUpdate {
  operationId: string
  operation: DatabaseOperation
  phase: DatabaseProgressPhase
  percent: number
  detail?: string
  current?: number
  total?: number
}

export interface DatabaseExportResult {
  canceled: boolean
  filePath?: string
  operationId?: string
}

export interface DatabaseImportResult {
  canceled: boolean
  restartRequired?: boolean
  operationId?: string
}

export interface DatabaseRestartResult {
  success: boolean
}

export interface DatabaseOperationContext {
  operationId: string
  onProgress?: (update: DatabaseProgressUpdate) => void
}
