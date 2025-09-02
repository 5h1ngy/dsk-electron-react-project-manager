export type ErrorCode =
  | 'ERR_VALIDATION'
  | 'ERR_PERMISSION'
  | 'ERR_NOT_FOUND'
  | 'ERR_CONFLICT'
  | 'ERR_INTERNAL'

export interface AppErrorOptions {
  cause?: unknown
  details?: unknown
}

export class AppError extends Error {
  constructor(
    public readonly code: ErrorCode,
    message: string,
    public readonly options: AppErrorOptions = {}
  ) {
    super(message, { cause: options.cause })
    this.name = 'AppError'
  }
}

export const isAppError = (error: unknown): error is AppError => error instanceof AppError

export const wrapError = (error: unknown, fallbackCode: ErrorCode = 'ERR_INTERNAL'): AppError => {
  if (isAppError(error)) {
    return error
  }
  const message = error instanceof Error ? error.message : 'Unexpected error'
  return new AppError(fallbackCode, message, { cause: error })
}
