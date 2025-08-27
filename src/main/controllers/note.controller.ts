import { ipcMain } from 'electron';
import { Inject, Service } from 'typedi';
import { NoteService } from '../services/note.service';
import { CreateNoteDto, SingleNoteResponseDto, UpdateNoteDto } from '../dtos/note.dto';
import { BaseController } from './base.controller';
import * as _logger from '../shared/logger';

@Service()
export class NoteController extends BaseController {

  constructor(
    @Inject() private _noteService: NoteService,
  ) {
    super();
    _logger.info('NoteController initialized');
  }

  public registerHandlers(): void {

    ipcMain.handle('notes:getByProject', async (_, projectId: number) => {
      _logger.info(`Getting notes for project ${projectId}`);
      const result = await this._noteService.getNotesByProject(projectId);
      return result;
    });

    ipcMain.handle('notes:getByTask', async (_, taskId: number) => {
      _logger.info(`Getting notes for task ${taskId}`);
      const result = await this._noteService.getNotesByTask(taskId);
      return result;
    });

    ipcMain.handle('notes:create', async (_, noteData: {
      content: string;
      projectId?: number;
      taskId?: number;
      userId: number;
    }) => {
      _logger.info(`Creating note for user ${noteData.userId}`);

      const dto = new CreateNoteDto(
        noteData.content,
        noteData.userId,
        noteData.projectId,
        noteData.taskId
      );

      const errors = dto.validate();
      if (errors.length > 0) {
        _logger.error(`Validation errors: ${JSON.stringify(errors)}`);
        return new SingleNoteResponseDto(false, 'Validation failed');
      }

      return await this._noteService.createNote(dto);
    });

    ipcMain.handle('notes:update', async (_, noteId: number, content: string) => {
      _logger.info(`Updating note ${noteId}`);

      const dto = new UpdateNoteDto(content);

      const errors = dto.validate();
      if (errors.length > 0) {
        _logger.error(`Validation errors: ${JSON.stringify(errors)}`);
        return new SingleNoteResponseDto(false, 'Validation failed');
      }

      return await this._noteService.updateNote(noteId, dto);
    });

    ipcMain.handle('notes:delete', async (_, noteId: number) => {
      _logger.info(`Deleting note ${noteId}`);
      return await this._noteService.deleteNote(noteId);
    });

  }
}
