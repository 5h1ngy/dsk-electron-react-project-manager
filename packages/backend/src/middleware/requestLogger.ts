import type { Request, Response, NextFunction } from 'express'
import { Middleware, type ExpressMiddlewareInterface } from 'routing-controllers'
import { Service } from 'typedi'

import type { RoleName } from '@services/services/auth/constants'
import { logger } from '@services/config/logger'

const REQUEST_ACTOR_SYMBOL = Symbol('requestActorContext')

interface RequestActorSnapshot {
  userId: string
  roles: RoleName[]
}

type InternalRequest = Request & {
  [REQUEST_ACTOR_SYMBOL]?: RequestActorSnapshot
}

const SENSITIVE_KEYS = ['password', 'token', 'authorization', 'cookie', 'secret']

const sanitizeValue = (value: unknown, depth = 0): unknown => {
  if (value === null || value === undefined) {
    return value
  }

  if (Buffer.isBuffer(value)) {
    return `[buffer:${value.length}]`
  }

  if (depth > 3) {
    return '[truncated]'
  }

  if (typeof value === 'string') {
    return value.length > 500 ? `${value.slice(0, 500)}...` : value
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return value
  }

  if (Array.isArray(value)) {
    return value.map((entry) => sanitizeValue(entry, depth + 1))
  }

  if (typeof value === 'object') {
    const sanitized: Record<string, unknown> = {}
    for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
      if (SENSITIVE_KEYS.includes(key.toLowerCase())) {
        sanitized[key] = '[redacted]'
        continue
      }
      sanitized[key] = sanitizeValue(entry, depth + 1)
    }
    return sanitized
  }

  return String(value)
}

const maskAuthorizationHeader = (value?: string): string | undefined => {
  if (!value) {
    return undefined
  }
  const [scheme, token] = value.split(' ')
  if (!token) {
    return value
  }
  const normalized = token.trim()
  if (!normalized) {
    return scheme ?? value
  }
  const masked =
    normalized.length > 8
      ? `${normalized.slice(0, 4)}...${normalized.slice(-4)}`
      : normalized
  return scheme ? `${scheme} ${masked}` : masked
}

const getRequestActor = (request: Request): RequestActorSnapshot | undefined =>
  (request as InternalRequest)[REQUEST_ACTOR_SYMBOL]

const buildLogPayload = (request: Request, statusCode: number, durationMs: number) => ({
  method: request.method,
  path: request.originalUrl ?? request.url,
  statusCode,
  durationMs,
  actor: getRequestActor(request),
  authHeader: maskAuthorizationHeader(request.header('authorization') ?? undefined),
  query: sanitizeValue(request.query),
  body: sanitizeValue(request.body)
})

export const attachRequestActor = (request: Request, actor: RequestActorSnapshot): void => {
  ;(request as InternalRequest)[REQUEST_ACTOR_SYMBOL] = actor
}

@Service()
@Middleware({ type: 'before' })
export class RequestLoggingMiddleware implements ExpressMiddlewareInterface {
  use(request: Request, response: Response, next: NextFunction): void {
    const start = process.hrtime.bigint()

    const logAndCleanup = (): void => {
      response.removeListener('finish', logAndCleanup)
      response.removeListener('close', logAndCleanup)
      const durationMs = Number(process.hrtime.bigint() - start) / 1_000_000
      const payload = buildLogPayload(request, response.statusCode, durationMs)
      logger.info(JSON.stringify(payload), 'HTTP')
    }

    response.on('finish', logAndCleanup)
    response.on('close', logAndCleanup)

    next()
  }
}
