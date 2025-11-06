import type { Request } from 'express'
import {
  Body,
  Delete,
  Get,
  JsonController,
  Param,
  Post,
  Put,
  Req
} from 'routing-controllers'
import { Service } from 'typedi'

import { BaseController } from '@api/controllers/BaseController'
import { ApiBearerAuth, ApiRequestBody, ApiResponse } from '@api/openapi/decorators'

@Service()
@ApiBearerAuth()
@JsonController('/roles')
export class RoleController extends BaseController {
  private get roleService() {
    return this.domain.roleService
  }

  @Get()
  @ApiResponse('RoleSummaryList')
  async listRoles(@Req() request: Request) {
    const { actor } = await this.requireActor(request)
    return await this.roleService.listRoles(actor)
  }

  @Get('/permissions')
  @ApiResponse('RolePermissionDefinitionList')
  async listPermissions(@Req() request: Request) {
    const { actor } = await this.requireActor(request)
    return await this.roleService.listPermissions(actor)
  }

  @Post()
  @ApiRequestBody('CreateRoleRequest')
  @ApiResponse('RoleSummary')
  async createRole(@Req() request: Request, @Body() payload: unknown) {
    const { actor } = await this.requireActor(request)
    return await this.roleService.createRole(actor, payload)
  }

  @Put('/:roleId')
  @ApiRequestBody('UpdateRoleRequest')
  @ApiResponse('RoleSummary')
  async updateRole(
    @Req() request: Request,
    @Param('roleId') roleId: string,
    @Body() payload: unknown
  ) {
    const { actor } = await this.requireActor(request)
    return await this.roleService.updateRole(actor, roleId, payload)
  }

  @Delete('/:roleId')
  @ApiResponse('OperationResult')
  async deleteRole(@Req() request: Request, @Param('roleId') roleId: string) {
    const { actor } = await this.requireActor(request)
    await this.roleService.deleteRole(actor, roleId)
    return { success: true }
  }

  @Post('/sync-defaults')
  @ApiResponse('RoleSummaryList')
  async syncDefaults(@Req() request: Request) {
    const { actor } = await this.requireActor(request)
    return await this.roleService.syncDefaults(actor)
  }
}
