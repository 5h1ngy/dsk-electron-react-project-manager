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

import { BaseController } from '@backend/controllers/BaseController'
import {
  backendBearerAuth,
  backendRequestBody,
  backendResponse
} from '@backend/openapi/decorators'

@Service()
@backendBearerAuth()
@JsonController()
export class NoteController extends BaseController {
  private get noteService() {
    return this.domain.noteService
  }

  @Get('/projects/:projectId/notes')
  @backendResponse('NoteSummaryList')
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
  @backendResponse('NoteDetailsDTO')
  async getNote(@Req() request: Request, @Param('noteId') noteId: string) {
    const { actor } = await this.requireActor(request)
    return await this.noteService.getNote(actor, noteId)
  }

  @Post('/notes')
  @backendRequestBody('CreateNoteRequest')
  @backendResponse('NoteDetailsDTO')
  async createNote(@Req() request: Request, @Body() payload: unknown) {
    const { actor } = await this.requireActor(request)
    return await this.noteService.createNote(actor, payload)
  }

  @Put('/notes/:noteId')
  @backendRequestBody('UpdateNoteRequest')
  @backendResponse('NoteDetailsDTO')
  async updateNote(
    @Req() request: Request,
    @Param('noteId') noteId: string,
    @Body() payload: unknown
  ) {
    const { actor } = await this.requireActor(request)
    return await this.noteService.updateNote(actor, noteId, payload)
  }

  @Delete('/notes/:noteId')
  @backendResponse('OperationResult')
  async deleteNote(@Req() request: Request, @Param('noteId') noteId: string) {
    const { actor } = await this.requireActor(request)
    await this.noteService.deleteNote(actor, noteId)
    return { success: true }
  }

  @Get('/notes/search')
  @backendResponse('NoteSearchResultList')
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
  @backendRequestBody('SearchNotesRequest')
  @backendResponse('NoteSearchResultList')
  async searchNotesAdvanced(@Req() request: Request, @Body() payload: unknown) {
    const { actor } = await this.requireActor(request)
    return await this.noteService.search(actor, payload)
  }

  @Post('/notes/query')
  @backendRequestBody('ListNotesRequest')
  @backendResponse('NoteSummaryList')
  async listNotesAdvanced(@Req() request: Request, @Body() payload: unknown) {
    const { actor } = await this.requireActor(request)
    return await this.noteService.listNotes(actor, payload)
  }
}
