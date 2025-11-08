import { JsonController, Get } from 'routing-controllers'
import { Service } from 'typedi'

import { BaseController } from '@backend/controllers/BaseController'
import { backendResponse } from '@backend/openapi/decorators'
import { env } from '@services/config/env'

@Service()
@JsonController('/health')
export class HealthController extends BaseController {
  @Get()
  @backendResponse('HealthStatus')
  async status() {
    return {
      status: 'healthy',
      version: env.appVersion,
      timestamp: new Date().toISOString(),
      uptimeSeconds: process.uptime(),
      runtime: env.runtimeTarget
    }
  }
}
