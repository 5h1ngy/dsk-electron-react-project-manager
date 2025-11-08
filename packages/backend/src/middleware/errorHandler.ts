import type { NextFunction, Request, Response } from 'express'
import { ExpressErrorMiddlewareInterface, HttpError, Middleware } from 'routing-controllers'
import { Service } from 'typedi'

import { AppError, isAppError, wrapError } from '@services/config/appError'
import { logger } from '@services/config/logger'

const mapAppErrorToStatus = (error: AppError): number => {
  switch (error.code) {
    case 'ERR_VALIDATION':
      return 400
    case 'ERR_PERMISSION':
      return 403
    case 'ERR_NOT_FOUND':
      return 404
    case 'ERR_CONFLICT':
      return 409
    default:
      return 500
  }
}

@Service()
@Middleware({ type: 'after' })
export class AppErrorHandler implements ExpressErrorMiddlewareInterface {
  error(error: unknown, _request: Request, response: Response, next: NextFunction): void {
    if (response.headersSent) {
      next(error)
      return
    }

    if (isAppError(error)) {
      const status = mapAppErrorToStatus(error)
      logger.warn(`${error.code}: ${error.message}`, 'API')
      response.status(status).json({
        error: {
          code: error.code,
          message: error.message,
          details: error.options.details ?? null
        }
      })
      return
    }

    if (error instanceof HttpError) {
      logger.warn(error.message, 'API')
      response.status(error.httpCode).json({
        error: {
          code: error.name,
          message: error.message
        }
      })
      return
    }

    const wrapped = wrapError(error)
    logger.error('Unhandled API error', 'API', wrapped)
    response.status(500).json({
      error: {
        code: wrapped.code,
        message: wrapped.message
      }
    })
  }
}
