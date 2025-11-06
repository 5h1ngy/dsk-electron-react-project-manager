import { JsonController, Get } from 'routing-controllers'
import { Service } from 'typedi'

import { BaseController } from '@api/controllers/BaseController'
import { ApiResponse } from '@api/openapi/decorators'
import { env } from '@services/config/env'

@Service()
@JsonController('/health')
export class HealthController extends BaseController {
  @Get()
  @ApiResponse('HealthStatus')
  async status() {
    return {
      status: 'healthy',
      version: env.appVersion,
      timestamp: new Date().toISOString(),
      uptimeSeconds: process.uptime()
    }
  }
}
