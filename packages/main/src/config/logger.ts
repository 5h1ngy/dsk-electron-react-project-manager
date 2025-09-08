import { env } from './env'
import type { LogLevelSetting } from './env.types'
import type { LogLevel, LoggerOptions } from './logger.types'
import { formatLogContext, padNumber } from './logger.helpers'

const RESET = '\x1b[0m'
const COLORS = {
  info: '\x1b[36m',
  warn: '\x1b[33m',
  error: '\x1b[31m',
  success: '\x1b[32m',
  debug: '\x1b[35m',
  renderer: '\x1b[90m',
  context: '\x1b[94m',
  timestamp: '\x1b[90m'
} as const

const LEVEL_TAG: Record<LogLevel, string> = {
  info: 'INFO',
  warn: 'WARN',
  error: 'ERROR',
  success: 'OK',
  debug: 'DEBUG'
}

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  error: 40,
  warn: 30,
  info: 20,
  success: 20,
  debug: 10
}

const FILTER_PRIORITY: Record<LogLevelSetting, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
  silent: Number.POSITIVE_INFINITY
}

export class AppLogger {
  private readonly level: LogLevelSetting
  private readonly writer: (line: string) => void
  private readonly clock: () => Date

  constructor(options: LoggerOptions = {}) {
    this.level = options.level ?? env.logLevel
    this.writer = options.writer ?? ((line) => process.stdout.write(`${line}\n`))
    this.clock = options.clock ?? (() => new Date())
  }

  info(message: string, context?: string): void {
    this.log('info', message, context)
  }

  warn(message: string, context?: string): void {
    this.log('warn', message, context)
  }

  error(message: string, context?: string, error?: unknown): void {
    this.log('error', message, context, error)
  }

  success(message: string, context?: string): void {
    this.log('success', message, context)
  }

  debug(message: string, context?: string): void {
    this.log('debug', message, context)
  }

  renderer(level: number, message: string, sourceId: string, line: number): void {
    const mappedLevel = this.mapConsoleLevel(level)
    const formatted = `${COLORS.renderer}${message}${RESET}`
    const rendererContext = sourceId ? `renderer:${sourceId}${line ? `:${line}` : ''}` : undefined
    this.write(
      `${this.formatLine(mappedLevel, formatted, rendererContext)}`
    )
  }

  private log(level: LogLevel, message: string, context?: string, error?: unknown): void {
    if (!this.shouldLog(level)) {
      return
    }
    this.write(this.formatLine(level, message, context))
    const serializedError = this.serializeError(error)
    if (serializedError) {
      this.write(serializedError)
    }
  }

  private shouldLog(level: LogLevel): boolean {
    const threshold = FILTER_PRIORITY[this.level]
    return LEVEL_PRIORITY[level] >= threshold && threshold !== Number.POSITIVE_INFINITY
  }

  private serializeError(error: unknown): string | undefined {
    if (!(error instanceof Error)) {
      return undefined
    }
    return `${COLORS.error}${error.stack ?? error.message}${RESET}`
  }

  private formatLine(level: LogLevel, message: string, context?: string): string {
    const timestamp = `${COLORS.timestamp}${this.formatTimestamp()}${RESET}`
    const tag = `${this.levelColor(level)}${LEVEL_TAG[level].padEnd(5)}${RESET}`
    const contextual = context ? `${COLORS.context}${formatLogContext(context)}${RESET}` : ''
    return `${timestamp} ${tag}${contextual} ${message}`
  }

  private formatTimestamp(): string {
    const date = this.clock()
    const y = date.getFullYear()
    const m = padNumber(date.getMonth() + 1)
    const d = padNumber(date.getDate())
    const h = padNumber(date.getHours())
    const min = padNumber(date.getMinutes())
    const s = padNumber(date.getSeconds())
    const ms = padNumber(date.getMilliseconds(), 3)
    return `${y}-${m}-${d} ${h}:${min}:${s}.${ms}`
  }

  private write(line: string): void {
    this.writer(line)
  }

  private levelColor(level: LogLevel): string {
    return COLORS[level]
  }

  private mapConsoleLevel(level: number): LogLevel {
    switch (level) {
      case 1:
        return 'warn'
      case 2:
        return 'error'
      case 3:
        return 'info'
      default:
        return 'info'
    }
  }
}

const defaultLogger = new AppLogger()

export const logger = {
  info: defaultLogger.info.bind(defaultLogger),
  warn: defaultLogger.warn.bind(defaultLogger),
  error: defaultLogger.error.bind(defaultLogger),
  success: defaultLogger.success.bind(defaultLogger),
  debug: defaultLogger.debug.bind(defaultLogger),
  renderer: defaultLogger.renderer.bind(defaultLogger)
}

let autoFillWarningLogged = false

export const shouldSuppressDevtoolsMessage = (sourceId: string, message: string): boolean => {
  const isDevtools = sourceId.startsWith('devtools://')
  const isAutofillNoise =
    message.includes('Request Autofill.enable failed') ||
    message.includes('Request Autofill.setAddresses failed')

  if (isDevtools && isAutofillNoise) {
    if (!autoFillWarningLogged) {
      defaultLogger.debug('Suppressed verbose devtools Autofill noise. DevTools remains functional.', 'DevTools')
      autoFillWarningLogged = true
    }
    return true
  }

  return false
}
