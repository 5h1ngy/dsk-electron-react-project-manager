import { env, type LogLevelSetting } from '../config/env'

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

type LogLevel = 'info' | 'warn' | 'error' | 'success' | 'debug'
type LogFilter = LogLevelSetting

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

const FILTER_PRIORITY: Record<LogFilter, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
  silent: Number.POSITIVE_INFINITY
}

const levelToColor = (level: LogLevel): string => COLORS[level]

const shouldLog = (level: LogLevel): boolean => {
  const threshold = FILTER_PRIORITY[env.logLevel]
  return LEVEL_PRIORITY[level] >= threshold && threshold !== Number.POSITIVE_INFINITY
}

const pad = (value: number, size = 2): string => value.toString().padStart(size, '0')

const formatTimestamp = (date = new Date()): string => {
  const y = date.getFullYear()
  const m = pad(date.getMonth() + 1)
  const d = pad(date.getDate())
  const h = pad(date.getHours())
  const min = pad(date.getMinutes())
  const s = pad(date.getSeconds())
  const ms = pad(date.getMilliseconds(), 3)
  return `${y}-${m}-${d} ${h}:${min}:${s}.${ms}`
}

const formatContext = (context?: string): string => {
  if (!context) {
    return ''
  }
  return ` ${COLORS.context}[${context}]${RESET}`
}

const writeLine = (formatted: string): void => {
  process.stdout.write(`${formatted}\n`)
}

const formatLine = (level: LogLevel, message: string, context?: string): string => {
  const timestamp = `${COLORS.timestamp}${formatTimestamp()}${RESET}`
  const tag = `${levelToColor(level)}${LEVEL_TAG[level].padEnd(5)}${RESET}`
  return `${timestamp} ${tag}${formatContext(context)} ${message}`
}

const serializeError = (error: unknown): string | undefined => {
  if (!(error instanceof Error)) {
    return undefined
  }
  return `${COLORS.error}${error.stack ?? error.message}${RESET}`
}

const log = (level: LogLevel, message: string, context?: string, error?: unknown): void => {
  if (!shouldLog(level)) {
    return
  }
  writeLine(formatLine(level, message, context))
  const serializedError = serializeError(error)
  if (serializedError) {
    writeLine(serializedError)
  }
}

const mapConsoleLevel = (level: number): LogLevel => {
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

const formatRendererSource = (sourceId: string, line: number): string => {
  if (!sourceId) {
    return ''
  }
  const suffix = line ? `:${line}` : ''
  return `${formatContext(`renderer:${sourceId}${suffix}`)}`
}

const renderer = (level: number, message: string, sourceId: string, line: number): void => {
  const mappedLevel = mapConsoleLevel(level)
  const formatted = `${COLORS.renderer}${message}${RESET}`
  writeLine(
    `${formatLine(mappedLevel, formatted)}${sourceId ? ` ${formatRendererSource(sourceId, line)}` : ''}`
  )
}

let autoFillWarningLogged = false

export const shouldSuppressDevtoolsMessage = (sourceId: string, message: string): boolean => {
  const isDevtools = sourceId.startsWith('devtools://')
  const isAutofillNoise =
    message.includes('Request Autofill.enable failed') ||
    message.includes('Request Autofill.setAddresses failed')

  if (isDevtools && isAutofillNoise) {
    if (!autoFillWarningLogged) {
      log(
        'debug',
        'Suppressed verbose devtools Autofill noise. DevTools remains functional.',
        'DevTools'
      )
      autoFillWarningLogged = true
    }
    return true
  }

  return false
}

export const logger = {
  info: (message: string, context?: string): void => log('info', message, context),
  warn: (message: string, context?: string): void => log('warn', message, context),
  error: (message: string, context?: string, error?: unknown): void =>
    log('error', message, context, error),
  success: (message: string, context?: string): void => log('success', message, context),
  debug: (message: string, context?: string): void => log('debug', message, context),
  renderer
}
