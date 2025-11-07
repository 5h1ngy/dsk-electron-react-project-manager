import type { Request } from 'express'
import { Body, Delete, Get, JsonController, Param, Post, Put, Req } from 'routing-controllers'
import { Service } from 'typedi'

import { BaseController } from '@api/controllers/BaseController'
import { ApiBearerAuth, ApiRequestBody, ApiResponse } from '@api/openapi/decorators'

@Service()
@ApiBearerAuth()
@JsonController()
export class SprintController extends BaseController {
  private get sprintService() {
    return this.domain.sprintService
  }

  @Get('/projects/:projectId/sprints')
  @ApiResponse('SprintList')
  async listSprints(@Req() request: Request, @Param('projectId') projectId: string) {
    const { actor } = await this.requireActor(request)
    return await this.sprintService.listByProject(actor, projectId)
  }

  @Get('/sprints/:sprintId')
  @ApiResponse('SprintDetailsDTO')
  async getSprint(@Req() request: Request, @Param('sprintId') sprintId: string) {
    const { actor } = await this.requireActor(request)
    return await this.sprintService.getSprint(actor, sprintId)
  }

  @Post('/projects/:projectId/sprints')
  @ApiRequestBody('CreateSprintRequest')
  @ApiResponse('SprintDTO')
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
  @ApiRequestBody('UpdateSprintRequest')
  @ApiResponse('SprintDTO')
  async updateSprint(
    @Req() request: Request,
    @Param('sprintId') sprintId: string,
    @Body() payload: unknown
  ) {
    const { actor } = await this.requireActor(request)
    return await this.sprintService.updateSprint(actor, sprintId, payload)
  }

  @Delete('/sprints/:sprintId')
  @ApiResponse('OperationResult')
  async deleteSprint(@Req() request: Request, @Param('sprintId') sprintId: string) {
    const { actor } = await this.requireActor(request)
    await this.sprintService.deleteSprint(actor, sprintId)
    return { success: true }
  }
}
