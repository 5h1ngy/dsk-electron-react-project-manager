import type { Request } from 'express'
import { Body, Delete, Get, JsonController, Param, Post, Put, Req } from 'routing-controllers'
import { Service } from 'typedi'

import { BaseController } from '@backend/controllers/BaseController'
import { ApiBearerAuth, ApiRequestBody, ApiResponse } from '@backend/openapi/decorators'

@Service()
@backendBearerAuth()
@JsonController()
export class SprintController extends BaseController {
  private get sprintService() {
    return this.domain.sprintService
  }

  @Get('/projects/:projectId/sprints')
  @backendResponse('SprintList')
  async listSprints(@Req() request: Request, @Param('projectId') projectId: string) {
    const { actor } = await this.requireActor(request)
    return await this.sprintService.listByProject(actor, projectId)
  }

  @Get('/sprints/:sprintId')
  @backendResponse('SprintDetailsDTO')
  async getSprint(@Req() request: Request, @Param('sprintId') sprintId: string) {
    const { actor } = await this.requireActor(request)
    return await this.sprintService.getSprint(actor, sprintId)
  }

  @Post('/projects/:projectId/sprints')
  @backendRequestBody('CreateSprintRequest')
  @backendResponse('SprintDTO')
  async createSprint(
    @Req() request: Request,
    @Param('projectId') projectId: string,
    @Body() payload: Record<string, unknown>
  ) {
    const { actor } = await this.requireActor(request)
    return await this.sprintService.createSprint(actor, {
      ...payload,
      projectId
    })
  }

  @Put('/sprints/:sprintId')
  @backendRequestBody('UpdateSprintRequest')
  @backendResponse('SprintDTO')
  async updateSprint(
    @Req() request: Request,
    @Param('sprintId') sprintId: string,
    @Body() payload: unknown
  ) {
    const { actor } = await this.requireActor(request)
    return await this.sprintService.updateSprint(actor, sprintId, payload)
  }

  @Delete('/sprints/:sprintId')
  @backendResponse('OperationResult')
  async deleteSprint(@Req() request: Request, @Param('sprintId') sprintId: string) {
    const { actor } = await this.requireActor(request)
    await this.sprintService.deleteSprint(actor, sprintId)
    return { success: true }
  }
}
