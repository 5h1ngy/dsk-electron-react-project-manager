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
@JsonController()
export class ViewController extends BaseController {
  private get viewService() {
    return this.domain.viewService
  }

  @Get('/projects/:projectId/views')
  @backendResponse('SavedViewList')
  async listViews(@Req() request: Request, @Param('projectId') projectId: string) {
    const { actor } = await this.requireActor(request)
    return await this.viewService.listViews(actor, { projectId })
  }

  @Post('/projects/:projectId/views')
  @backendRequestBody('CreateViewRequest')
  @backendResponse('SavedViewDTO')
  async createView(
    @Req() request: Request,
    @Param('projectId') projectId: string,
    @Body() payload: Record<string, unknown>
  ) {
    const { actor } = await this.requireActor(request)
    return await this.viewService.createView(actor, {
      ...payload,
      projectId
    })
  }

  @Put('/views/:viewId')
  @backendRequestBody('UpdateViewRequest')
  @backendResponse('SavedViewDTO')
  async updateView(
    @Req() request: Request,
    @Param('viewId') viewId: string,
    @Body() payload: unknown
  ) {
    const { actor } = await this.requireActor(request)
    return await this.viewService.updateView(actor, viewId, payload)
  }

  @Delete('/views/:viewId')
  @backendResponse('OperationResult')
  async deleteView(@Req() request: Request, @Param('viewId') viewId: string) {
    const { actor } = await this.requireActor(request)
    await this.viewService.deleteView(actor, viewId)
    return { success: true }
  }
}
