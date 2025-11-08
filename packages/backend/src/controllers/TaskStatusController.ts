import type { Request } from 'express'
import { Body, Delete, Get, JsonController, Param, Post, Put, Req } from 'routing-controllers'
import { Service } from 'typedi'

import { BaseController } from '@backend/controllers/BaseController'
import { ApiBearerAuth, ApiRequestBody, ApiResponse } from '@backend/openapi/decorators'

@Service()
@backendBearerAuth()
@JsonController()
export class TaskStatusController extends BaseController {
  private get statusService() {
    return this.domain.taskStatusService
  }

  @Get('/projects/:projectId/statuses')
  @backendResponse('TaskStatusList')
  async listStatuses(@Req() request: Request, @Param('projectId') projectId: string) {
    const { actor } = await this.requireActor(request)
    return await this.statusService.listStatuses(actor, projectId)
  }

  @Post('/projects/:projectId/statuses')
  @backendRequestBody('CreateTaskStatusRequest')
  @backendResponse('TaskStatusDTO')
  async createStatus(
    @Req() request: Request,
    @Param('projectId') projectId: string,
    @Body() payload: Record<string, unknown>
  ) {
    const { actor } = await this.requireActor(request)
    return await this.statusService.createStatus(actor, {
      ...payload,
      projectId
    })
  }

  @Put('/statuses/:statusId')
  @backendRequestBody('UpdateTaskStatusRequest')
  @backendResponse('TaskStatusDTO')
  async updateStatus(
    @Req() request: Request,
    @Param('statusId') statusId: string,
    @Body() payload: unknown
  ) {
    const { actor } = await this.requireActor(request)
    return await this.statusService.updateStatus(actor, statusId, payload)
  }

  @Post('/projects/:projectId/statuses/reorder')
  @backendRequestBody('ReorderTaskStatusRequest')
  @backendResponse('TaskStatusList')
  async reorderStatuses(
    @Req() request: Request,
    @Param('projectId') projectId: string,
    @Body() payload: Record<string, unknown>
  ) {
    const { actor } = await this.requireActor(request)
    return await this.statusService.reorderStatuses(actor, {
      ...payload,
      projectId
    })
  }

  @Delete('/statuses/:statusId')
  @backendRequestBody('DeleteTaskStatusRequest')
  @backendResponse('OperationResult')
  async deleteStatus(
    @Req() request: Request,
    @Param('statusId') statusId: string,
    @Body() payload: { fallbackStatusId?: string }
  ) {
    const { actor } = await this.requireActor(request)
    return await this.statusService.deleteStatus(actor, {
      statusId,
      fallbackStatusId: payload?.fallbackStatusId
    })
  }
}
