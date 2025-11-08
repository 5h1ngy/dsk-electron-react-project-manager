import type { Request } from 'express'
import { Body, Delete, Get, JsonController, Param, Post, Put, Req } from 'routing-controllers'
import { Service } from 'typedi'

import { BaseController } from '@backend/controllers/BaseController'
import { ApiBearerAuth, ApiRequestBody, ApiResponse } from '@backend/openapi/decorators'

@Service()
@backendBearerAuth()
@JsonController('/roles')
export class RoleController extends BaseController {
  private get roleService() {
    return this.domain.roleService
  }

  @Get()
  @backendResponse('RoleSummaryList')
  async listRoles(@Req() request: Request) {
    const { actor } = await this.requireActor(request)
    return await this.roleService.listRoles(actor)
  }

  @Get('/permissions')
  @backendResponse('RolePermissionDefinitionList')
  async listPermissions(@Req() request: Request) {
    const { actor } = await this.requireActor(request)
    return await this.roleService.listPermissions(actor)
  }

  @Post()
  @backendRequestBody('CreateRoleRequest')
  @backendResponse('RoleSummary')
  async createRole(@Req() request: Request, @Body() payload: unknown) {
    const { actor } = await this.requireActor(request)
    return await this.roleService.createRole(actor, payload)
  }

  @Put('/:roleId')
  @backendRequestBody('UpdateRoleRequest')
  @backendResponse('RoleSummary')
  async updateRole(
    @Req() request: Request,
    @Param('roleId') roleId: string,
    @Body() payload: unknown
  ) {
    const { actor } = await this.requireActor(request)
    return await this.roleService.updateRole(actor, roleId, payload)
  }

  @Delete('/:roleId')
  @backendResponse('OperationResult')
  async deleteRole(@Req() request: Request, @Param('roleId') roleId: string) {
    const { actor } = await this.requireActor(request)
    await this.roleService.deleteRole(actor, roleId)
    return { success: true }
  }

  @Post('/sync-defaults')
  @backendResponse('RoleSummaryList')
  async syncDefaults(@Req() request: Request) {
    const { actor } = await this.requireActor(request)
    return await this.roleService.syncDefaults(actor)
  }
}
