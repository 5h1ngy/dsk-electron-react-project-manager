import type { Request } from 'express'
import {
  Body,
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
import { ApiBearerAuth, ApiRequestBody, ApiResponse } from '@api/openapi/decorators'

@Service()
@ApiBearerAuth()
@JsonController()
export class NoteController extends BaseController {
  private get noteService() {
    return this.domain.noteService
  }

  @Get('/projects/:projectId/notes')
  @ApiResponse('NoteSummaryList')
  async listNotes(
    @Req() request: Request,
    @Param('projectId') projectId: string,
    @QueryParam('notebook') notebook?: string,
    @QueryParam('tag') tag?: string,
    @QueryParam('includePrivate') includePrivate?: string
  ) {
    const { actor } = await this.requireActor(request)
    const payload = {
      projectId,
      notebook: notebook ?? undefined,
      tag: tag ?? undefined,
      includePrivate: includePrivate === 'true'
    }
    return await this.noteService.listNotes(actor, payload)
  }

  @Get('/notes/:noteId')
  @ApiResponse('NoteDetailsDTO')
  async getNote(@Req() request: Request, @Param('noteId') noteId: string) {
    const { actor } = await this.requireActor(request)
    return await this.noteService.getNote(actor, noteId)
  }

  @Post('/notes')
  @ApiRequestBody('CreateNoteRequest')
  @ApiResponse('NoteDetailsDTO')
  async createNote(@Req() request: Request, @Body() payload: unknown) {
    const { actor } = await this.requireActor(request)
    return await this.noteService.createNote(actor, payload)
  }

  @Put('/notes/:noteId')
  @ApiRequestBody('UpdateNoteRequest')
  @ApiResponse('NoteDetailsDTO')
  async updateNote(
    @Req() request: Request,
    @Param('noteId') noteId: string,
    @Body() payload: unknown
  ) {
    const { actor } = await this.requireActor(request)
    return await this.noteService.updateNote(actor, noteId, payload)
  }

  @Delete('/notes/:noteId')
  @ApiResponse('OperationResult')
  async deleteNote(@Req() request: Request, @Param('noteId') noteId: string) {
    const { actor } = await this.requireActor(request)
    await this.noteService.deleteNote(actor, noteId)
    return { success: true }
  }

  @Get('/notes/search')
  @ApiResponse('NoteSearchResultList')
  async searchNotes(
    @Req() request: Request,
    @QueryParam('q') query: string,
    @QueryParam('projectId') projectId?: string
  ) {
    const { actor } = await this.requireActor(request)
    return await this.noteService.search(actor, {
      query,
      projectId: projectId ?? undefined
    })
  }

  @Post('/notes/search')
  @ApiRequestBody('SearchNotesRequest')
  @ApiResponse('NoteSearchResultList')
  async searchNotesAdvanced(
    @Req() request: Request,
    @Body() payload: unknown
  ) {
    const { actor } = await this.requireActor(request)
    return await this.noteService.search(actor, payload)
  }

  @Post('/notes/query')
  @ApiRequestBody('ListNotesRequest')
  @ApiResponse('NoteSummaryList')
  async listNotesAdvanced(
    @Req() request: Request,
    @Body() payload: unknown
  ) {
    const { actor } = await this.requireActor(request)
    return await this.noteService.listNotes(actor, payload)
  }
}
