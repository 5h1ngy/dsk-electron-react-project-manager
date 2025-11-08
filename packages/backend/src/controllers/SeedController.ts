import { JsonController, Post } from 'routing-controllers'
import { Service } from 'typedi'

import { BaseController } from '@backend/controllers/BaseController'
import { ApiResponse } from '@backend/openapi/decorators'
import { DevelopmentSeeder } from '@seeding/DevelopmentSeeder'
import type { DevelopmentSeederOptions } from '@seeding/DevelopmentSeeder.types'

@Service()
@JsonController('/seed')
export class SeedController extends BaseController {
  @Post('/')
  @backendResponse('OperationResult')
  async runSeeder(body?: DevelopmentSeederOptions): Promise<{ success: true }> {
    const seeder = new DevelopmentSeeder(this.domain.sequelize, body)
    await seeder.run()
    return { success: true }
  }
}
