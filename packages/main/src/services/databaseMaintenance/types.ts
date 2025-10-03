export interface DatabaseExportResult {
  canceled: boolean
  filePath?: string
}

export interface DatabaseImportResult {
  canceled: boolean
  restartScheduled?: boolean
}
