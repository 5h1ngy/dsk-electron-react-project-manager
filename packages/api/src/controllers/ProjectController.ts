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

@Service()
@JsonController('/projects')
export class ProjectController extends BaseController {
  private get projectService() {
    return this.domain.projectService
  }

  @Get()
  async listProjects(@Req() request: Request) {
    const { actor } = await this.requireActor(request)
    return await this.projectService.listProjects(actor)
  }

  @Get('/:projectId')
  async getProject(
    @Req() request: Request,
    @Param('projectId') projectId: string
  ) {
    const { actor } = await this.requireActor(request)
    return await this.projectService.getProject(actor, projectId)
  }

  @Post()
  async createProject(@Req() request: Request, @Body() payload: unknown) {
    const { actor } = await this.requireActor(request)
    return await this.projectService.createProject(actor, payload)
  }

  @Put('/:projectId')
  async updateProject(
    @Req() request: Request,
    @Param('projectId') projectId: string,
    @Body() payload: unknown
  ) {
    const { actor } = await this.requireActor(request)
    return await this.projectService.updateProject(actor, projectId, payload)
  }

  @Delete('/:projectId')
  async deleteProject(
    @Req() request: Request,
    @Param('projectId') projectId: string
  ) {
    const { actor } = await this.requireActor(request)
    await this.projectService.deleteProject(actor, projectId)
    return { success: true }
  }

  @Put('/:projectId/members')
  async upsertMember(
    @Req() request: Request,
    @Param('projectId') projectId: string,
    @Body() payload: unknown
  ) {
    const { actor } = await this.requireActor(request)
    return await this.projectService.addOrUpdateMember(actor, projectId, payload)
  }

  @Delete('/:projectId/members/:userId')
  async removeMember(
    @Req() request: Request,
    @Param('projectId') projectId: string,
    @Param('userId') userId: string
  ) {
    const { actor } = await this.requireActor(request)
    return await this.projectService.removeMember(actor, projectId, userId)
  }
}
