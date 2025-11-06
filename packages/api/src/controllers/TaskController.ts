import type { Request } from 'express'
import {
  Body,
  BadRequestError,
  Delete,
  Get,
  JsonController,
  Param,
  Post,
  Put,
  QueryParam,
  Req
} from 'routing-controllers'
import { Service } from 'typedi'

import { BaseController } from '@api/controllers/BaseController'

@Service()
@JsonController()
export class TaskController extends BaseController {
  private get taskService() {
    return this.domain.taskService
  }

  @Get('/projects/:projectId/tasks')
  async listByProject(
    @Req() request: Request,
    @Param('projectId') projectId: string
  ) {
    const { actor } = await this.requireActor(request)
    return await this.taskService.listByProject(actor, projectId)
  }

  @Get('/tasks/:taskId')
  async getTask(@Req() request: Request, @Param('taskId') taskId: string) {
    const { actor } = await this.requireActor(request)
    return await this.taskService.getTask(actor, taskId)
  }

  @Post('/tasks')
  async createTask(@Req() request: Request, @Body() payload: unknown) {
    const { actor } = await this.requireActor(request)
    return await this.taskService.createTask(actor, payload)
  }

  @Put('/tasks/:taskId')
  async updateTask(
    @Req() request: Request,
    @Param('taskId') taskId: string,
    @Body() payload: unknown
  ) {
    const { actor } = await this.requireActor(request)
    return await this.taskService.updateTask(actor, taskId, payload)
  }

  @Post('/tasks/:taskId/move')
  async moveTask(
    @Req() request: Request,
    @Param('taskId') taskId: string,
    @Body() payload: unknown
  ) {
    const { actor } = await this.requireActor(request)
    return await this.taskService.moveTask(actor, taskId, payload)
  }

  @Delete('/tasks/:taskId')
  async deleteTask(@Req() request: Request, @Param('taskId') taskId: string) {
    const { actor } = await this.requireActor(request)
    await this.taskService.deleteTask(actor, taskId)
    return { success: true }
  }

  @Get('/tasks/:taskId/comments')
  async listComments(
    @Req() request: Request,
    @Param('taskId') taskId: string
  ) {
    const { actor } = await this.requireActor(request)
    return await this.taskService.listComments(actor, taskId)
  }

  @Post('/tasks/:taskId/comments')
  async addComment(
    @Req() request: Request,
    @Param('taskId') taskId: string,
    @Body() payload: Record<string, unknown>
  ) {
    const { actor } = await this.requireActor(request)
    return await this.taskService.addComment(actor, {
      ...payload,
      taskId
    })
  }

  @Get('/tasks/search')
  async searchTasks(
    @Req() request: Request,
    @QueryParam('q') query: string | undefined,
    @QueryParam('projectId') projectId?: string
  ) {
    const { actor } = await this.requireActor(request)
    if (!query || query.trim().length === 0) {
      throw new BadRequestError('Query parameter "q" is required')
    }
    return await this.taskService.search(actor, {
      query,
      projectId: projectId ?? undefined
    })
  }

  @Post('/tasks/search')
  async searchTasksAdvanced(
    @Req() request: Request,
    @Body() payload: unknown
  ) {
    const { actor } = await this.requireActor(request)
    return await this.taskService.search(actor, payload)
  }
}
