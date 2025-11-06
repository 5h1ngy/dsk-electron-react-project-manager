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
import type { Request } from 'express'
import { Service } from 'typedi'

import { BaseController } from '@api/controllers/BaseController'

@Service()
@JsonController('/projects/:projectId/wiki')
export class WikiController extends BaseController {
  private get wikiService() {
    return this.domain.wikiService
  }

  @Get()
  async listPages(
    @Req() request: Request,
    @Param('projectId') projectId: string
  ) {
    const { actor } = await this.requireActor(request)
    return await this.wikiService.listPages(actor, projectId)
  }

  @Get('/:pageId')
  async getPage(
    @Req() request: Request,
    @Param('projectId') projectId: string,
    @Param('pageId') pageId: string
  ) {
    const { actor } = await this.requireActor(request)
    return await this.wikiService.getPage(actor, projectId, pageId)
  }

  @Post()
  async createPage(
    @Req() request: Request,
    @Param('projectId') projectId: string,
    @Body() payload: unknown
  ) {
    const { actor } = await this.requireActor(request)
    return await this.wikiService.createPage(actor, projectId, payload)
  }

  @Put('/:pageId')
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
  async listRevisions(
    @Req() request: Request,
    @Param('projectId') projectId: string,
    @Param('pageId') pageId: string
  ) {
    const { actor } = await this.requireActor(request)
    return await this.wikiService.listRevisions(actor, projectId, pageId)
  }

  @Post('/:pageId/revisions/:revisionId/restore')
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
