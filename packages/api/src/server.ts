import 'reflect-metadata'

import type { Server } from 'node:http'
import {
  createExpressServer,
  getMetadataArgsStorage,
  useContainer
} from 'routing-controllers'
import { Container } from 'typedi'
import { routingControllersToSpec } from 'routing-controllers-openapi'
import swaggerUi from 'swagger-ui-express'
import { OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi'

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
  HealthController,
  SeedController
} from '@api/controllers'
import { AppErrorHandler } from '@api/middleware/errorHandler'
import { bootstrapDomain } from '@api/startup/bootstrap'
import { ApiContextToken } from '@api/startup/context'
import { logger } from '@services/config/logger'
import { env } from '@services/config/env'
import { apiRegistry } from '@api/openapi/schemas'

type ComponentsObject = {
  schemas?: Record<string, unknown>
  securitySchemes?: Record<string, unknown>
  [key: string]: unknown
}

const DEFAULT_PORT = 3333

const resolvePort = (): number => {
  const parsed = Number(process.env.API_PORT ?? DEFAULT_PORT)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_PORT
}

const registerShutdownHooks = (
  server: Server,
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

const controllers = [
  AuthController,
  ProjectController,
  TaskController,
  TaskStatusController,
  NoteController,
  ViewController,
  RoleController,
  SprintController,
  WikiController,
  HealthController,
  SeedController
]

const mergeComponents = (
  base: ComponentsObject | undefined,
  extra: ComponentsObject | undefined
): ComponentsObject | undefined => {
  if (!extra) {
    return base
  }

  if (!base) {
    return extra
  }

  return {
    ...extra,
    ...base,
    schemas: {
      ...(extra.schemas ?? {}),
      ...(base.schemas ?? {})
    },
    securitySchemes: {
      ...(extra.securitySchemes ?? {}),
      ...(base.securitySchemes ?? {})
    }
  }
}

const main = async () => {
  useContainer(Container)
  const runtime = await bootstrapDomain()
  Container.set(ApiContextToken, { domain: runtime.domain })

  const app = createExpressServer({
    middlewares: [AppErrorHandler],
    controllers,
    defaultErrorHandler: false,
    cors: true,
    validation: false
  })

  const storage = getMetadataArgsStorage()
  const openApiSpec = routingControllersToSpec(
    storage,
    { controllers },
    {
      info: {
        title: 'DSK Project Manager API',
        version: env.appVersion
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer'
          }
        }
      },
      security: [{ bearerAuth: [] }]
    }
  )
  const generator = new OpenApiGeneratorV3(apiRegistry.definitions)
  const generated = generator.generateComponents()
  openApiSpec.components = mergeComponents(
    openApiSpec.components as ComponentsObject | undefined,
    generated.components as ComponentsObject | undefined
  ) as typeof openApiSpec.components

  app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec))
  app.get('/docs.json', (_req, res) => {
    res.json(openApiSpec)
  })

  const port = resolvePort()
  const server = app.listen(port, () => {
    logger.info(`API server listening on port ${port}`, 'API')
  }) as Server

  registerShutdownHooks(server, runtime.shutdown)
}

main().catch((error) => {
  logger.error('Failed to start API server', 'API', error)
  process.exit(1)
})
