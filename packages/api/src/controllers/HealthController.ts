import { JsonController, Get } from 'routing-controllers'
import { Service } from 'typedi'

import { BaseController } from '@api/controllers/BaseController'
import { env } from '@services/config/env'

@Service()
@JsonController('/health')
export class HealthController extends BaseController {
  @Get()
  async status() {
    return {
      status: 'ok',
      version: env.appVersion
    }
  }
}
