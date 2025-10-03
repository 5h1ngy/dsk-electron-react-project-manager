export interface DatabaseExportResult {
  canceled: boolean
  filePath?: string
}

export interface DatabaseImportResult {
  canceled: boolean
  restartRequired?: boolean
}

export interface DatabaseRestartResult {
  success: boolean
}
