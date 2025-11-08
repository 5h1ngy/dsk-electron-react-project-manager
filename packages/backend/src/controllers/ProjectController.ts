import type { Request } from 'express'
import { Body, Delete, Get, JsonController, Param, Post, Put, Req } from 'routing-controllers'
import { Service } from 'typedi'

import { BaseController } from '@backend/controllers/BaseController'
import {
  backendBearerAuth,
  backendRequestBody,
  backendResponse
} from '@backend/openapi/decorators'

@Service()
@backendBearerAuth()
@JsonController('/projects')
export class ProjectController extends BaseController {
  private get projectService() {
    return this.domain.projectService
  }

  @Get()
  @backendResponse('ProjectSummaryList')
  async listProjects(@Req() request: Request) {
    const { actor } = await this.requireActor(request)
    return await this.projectService.listProjects(actor)
  }

  @Get('/:projectId')
  @backendResponse('ProjectDetailsDTO')
  async getProject(@Req() request: Request, @Param('projectId') projectId: string) {
    const { actor } = await this.requireActor(request)
    return await this.projectService.getProject(actor, projectId)
  }

  @Post()
  @backendRequestBody('CreateProjectRequest')
  @backendResponse('ProjectDetailsDTO')
  async createProject(@Req() request: Request, @Body() payload: unknown) {
    const { actor } = await this.requireActor(request)
    return await this.projectService.createProject(actor, payload)
  }

  @Put('/:projectId')
  @backendRequestBody('UpdateProjectRequest')
  @backendResponse('ProjectDetailsDTO')
  async updateProject(
    @Req() request: Request,
    @Param('projectId') projectId: string,
    @Body() payload: unknown
  ) {
    const { actor } = await this.requireActor(request)
    return await this.projectService.updateProject(actor, projectId, payload)
  }

  @Delete('/:projectId')
  @backendResponse('OperationResult')
  async deleteProject(@Req() request: Request, @Param('projectId') projectId: string) {
    const { actor } = await this.requireActor(request)
    await this.projectService.deleteProject(actor, projectId)
    return { success: true }
  }

  @Put('/:projectId/members')
  @backendRequestBody('ProjectMemberRequest')
  @backendResponse('ProjectDetailsDTO')
  async upsertMember(
    @Req() request: Request,
    @Param('projectId') projectId: string,
    @Body() payload: unknown
  ) {
    const { actor } = await this.requireActor(request)
    return await this.projectService.addOrUpdateMember(actor, projectId, payload)
  }

  @Delete('/:projectId/members/:userId')
  @backendResponse('ProjectDetailsDTO')
  async removeMember(
    @Req() request: Request,
    @Param('projectId') projectId: string,
    @Param('userId') userId: string
  ) {
    const { actor } = await this.requireActor(request)
    return await this.projectService.removeMember(actor, projectId, userId)
  }
}
