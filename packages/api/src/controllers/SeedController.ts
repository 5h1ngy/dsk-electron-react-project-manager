import { JsonController, Post } from 'routing-controllers'
import { Service } from 'typedi'

import { BaseController } from '@api/controllers/BaseController'
import { ApiResponse } from '@api/openapi/decorators'
import { DevelopmentSeeder } from '@seeding/DevelopmentSeeder'
import type { DevelopmentSeederOptions } from '@seeding/DevelopmentSeeder.types'

@Service()
@JsonController('/seed')
export class SeedController extends BaseController {
  @Post('/')
  @ApiResponse('OperationResult')
  async runSeeder(body?: DevelopmentSeederOptions): Promise<{ success: true }> {
    const seeder = new DevelopmentSeeder(this.domain.sequelize, body)
    await seeder.run()
    return { success: true }
  }
}
