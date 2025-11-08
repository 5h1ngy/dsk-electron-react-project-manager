import { Body, Delete, Get, JsonController, Param, Post, Put, Req } from 'routing-controllers'
import type { Request } from 'express'
import { Service } from 'typedi'

import { BaseController } from '@backend/controllers/BaseController'
import {
  backendBearerAuth,
  backendRequestBody,
  backendResponse
} from '@backend/openapi/decorators'

@Service()
@backendBearerAuth()
@JsonController('/projects/:projectId/wiki')
export class WikiController extends BaseController {
  private get wikiService() {
    return this.domain.wikiService
  }

  @Get()
  @backendResponse('WikiPageSummaryList')
  async listPages(@Req() request: Request, @Param('projectId') projectId: string) {
    const { actor } = await this.requireActor(request)
    return await this.wikiService.listPages(actor, projectId)
  }

  @Get('/:pageId')
  @backendResponse('WikiPageDetailsDTO')
  async getPage(
    @Req() request: Request,
    @Param('projectId') projectId: string,
    @Param('pageId') pageId: string
  ) {
    const { actor } = await this.requireActor(request)
    return await this.wikiService.getPage(actor, projectId, pageId)
  }

  @Post()
  @backendRequestBody('CreateWikiPageRequest')
  @backendResponse('WikiPageDetailsDTO')
  async createPage(
    @Req() request: Request,
    @Param('projectId') projectId: string,
    @Body() payload: unknown
  ) {
    const { actor } = await this.requireActor(request)
    return await this.wikiService.createPage(actor, projectId, payload)
  }

  @Put('/:pageId')
  @backendRequestBody('UpdateWikiPageRequest')
  @backendResponse('WikiPageDetailsDTO')
  async updatePage(
    @Req() request: Request,
    @Param('projectId') projectId: string,
    @Param('pageId') pageId: string,
    @Body() payload: unknown
  ) {
    const { actor } = await this.requireActor(request)
    return await this.wikiService.updatePage(actor, projectId, pageId, payload)
  }

  @Delete('/:pageId')
  @backendResponse('OperationResult')
  async deletePage(
    @Req() request: Request,
    @Param('projectId') projectId: string,
    @Param('pageId') pageId: string
  ) {
    const { actor } = await this.requireActor(request)
    await this.wikiService.deletePage(actor, projectId, pageId)
    return { success: true }
  }

  @Get('/:pageId/revisions')
  @backendResponse('WikiRevisionList')
  async listRevisions(
    @Req() request: Request,
    @Param('projectId') projectId: string,
    @Param('pageId') pageId: string
  ) {
    const { actor } = await this.requireActor(request)
    return await this.wikiService.listRevisions(actor, projectId, pageId)
  }

  @Post('/:pageId/revisions/:revisionId/restore')
  @backendResponse('WikiPageDetailsDTO')
  async restoreRevision(
    @Req() request: Request,
    @Param('projectId') projectId: string,
    @Param('pageId') pageId: string,
    @Param('revisionId') revisionId: string
  ) {
    const { actor } = await this.requireActor(request)
    return await this.wikiService.restoreRevision(actor, projectId, pageId, revisionId)
  }
}
