import 'reflect-metadata'

import express from 'express'
import { createExpressServer, useContainer } from 'routing-controllers'
import { Container } from 'typedi'

import {
  AuthController,
  ProjectController,
  TaskController,
  TaskStatusController,
  NoteController,
  ViewController,
  RoleController,
  SprintController,
  WikiController,
  HealthController
} from '@api/controllers'
import { AppErrorHandler } from '@api/middleware/errorHandler'
import { bootstrapDomain } from '@api/startup/bootstrap'
import { ApiContextToken } from '@api/startup/context'
import { logger } from '@services/config/logger'

const DEFAULT_PORT = 3333

const resolvePort = (): number => {
  const parsed = Number(process.env.API_PORT ?? DEFAULT_PORT)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_PORT
}

const registerShutdownHooks = (
  server: ReturnType<typeof express['listen']>,
  teardown: () => Promise<void>
): void => {
  const shutdown = async (signal: string) => {
    logger.warn(`Received ${signal}, shutting down API`, 'API')
    await new Promise<void>((resolve) => server.close(() => resolve()))
    await teardown()
    process.exit(0)
  }

  process.on('SIGINT', () => void shutdown('SIGINT'))
  process.on('SIGTERM', () => void shutdown('SIGTERM'))
}

const main = async () => {
  useContainer(Container)
  const runtime = await bootstrapDomain()
  Container.set(ApiContextToken, { domain: runtime.domain })

  const app = createExpressServer({
    middlewares: [AppErrorHandler],
    controllers: [
      AuthController,
      ProjectController,
      TaskController,
      TaskStatusController,
      NoteController,
      ViewController,
      RoleController,
      SprintController,
      WikiController,
      HealthController
    ],
    defaultErrorHandler: false,
    cors: true,
    validation: false
  })

  const port = resolvePort()
  const server = app.listen(port, () => {
    logger.info(`API server listening on port ${port}`, 'API')
  })

  registerShutdownHooks(server, runtime.shutdown)
}

main().catch((error) => {
  logger.error('Failed to start API server', 'API', error)
  process.exit(1)
})
