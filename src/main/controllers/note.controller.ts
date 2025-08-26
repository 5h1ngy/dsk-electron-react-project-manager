import { ipcMain } from 'electron';
import { Service } from 'typedi';
import noteService from '../services/note.service';
import { CreateNoteDto, UpdateNoteDto, NoteResponseDto, NoteListResponseDto } from '../dtos/note.dto';
import { BaseController } from './base.controller';
import { logger } from '../shared/logger';

/**
 * Controller for note-related IPC operations
 */
@Service()
export class NoteController extends BaseController {
  constructor() {
    super();
  }



  /**
   * Register all note IPC handlers
   */
  public registerHandlers(): void {
    // Get all notes for a project
    ipcMain.handle('notes:getByProject', async (_, projectId: number) => {
      logger.info(`Getting notes for project ${projectId}`);
      const result = await noteService.getNotesByProject(projectId);
      
      return new NoteListResponseDto(
        result.success,
        result.message,
        result.notes?.map(n => new NoteResponseDto(
          n.id,
          n.content,
          n.userId,
          (n as any).projectId,
          n.taskId || undefined,
          n.createdAt,
          n.updatedAt
        )) || []
      );
    });

    // Get all notes for a task
    ipcMain.handle('notes:getByTask', async (_, taskId: number) => {
      logger.info(`Getting notes for task ${taskId}`);
      const result = await noteService.getNotesByTask(taskId);
      
      return new NoteListResponseDto(
        result.success,
        result.message,
        result.notes?.map(n => new NoteResponseDto(
          n.id,
          n.content,
          n.userId,
          (n as any).projectId,
          n.taskId || undefined,
          n.createdAt,
          n.updatedAt
        )) || []
      );
    });

    // Create a new note
    ipcMain.handle('notes:create', async (_, noteData: {
      content: string;
      projectId?: number;
      taskId?: number;
      userId: number;
    }) => {
      logger.info(`Creating note for user ${noteData.userId}`);
      
      const dto = new CreateNoteDto(
        noteData.content,
        noteData.userId,
        noteData.projectId,
        noteData.taskId
      );
      
      // Validate dto
      const errors = dto.validate();
      if (errors.length > 0) {
        logger.error(`Validation errors: ${JSON.stringify(errors)}`);
        return { success: false, message: 'Validation failed', errors };
      }
      
      const result = await noteService.createNote(dto);
      
      if (!result.success || !result.note) {
        return { success: false, message: result.message || 'Failed to create note' };
      }
      
      return new NoteResponseDto(
        result.note.id,
        result.note.content,
        result.note.userId,
        (result.note as any).projectId,
        result.note.taskId || undefined,
        result.note.createdAt,
        result.note.updatedAt
      );
    });

    // Update a note
    ipcMain.handle('notes:update', async (_, noteId: number, content: string) => {
      logger.info(`Updating note ${noteId}`);
      
      const dto = new UpdateNoteDto(content);
      
      // Validate dto
      const errors = dto.validate();
      if (errors.length > 0) {
        logger.error(`Validation errors: ${JSON.stringify(errors)}`);
        return { success: false, message: 'Validation failed', errors };
      }
      
      // Il service accetta direttamente la stringa del contenuto, non il DTO
      const result = await noteService.updateNote(noteId, dto.content);
      
      if (!result.success || !result.note) {
        return { success: false, message: result.message || 'Failed to update note' };
      }
      
      return new NoteResponseDto(
        result.note.id,
        result.note.content,
        result.note.userId,
        (result.note as any).projectId,
        result.note.taskId || undefined,
        result.note.createdAt,
        result.note.updatedAt
      );
    });

    // Delete a note
    ipcMain.handle('notes:delete', async (_, noteId: number) => {
      logger.info(`Deleting note ${noteId}`);
      const result = await noteService.deleteNote(noteId);
      return { success: result.success, message: result.message || (result.success ? 'Note deleted successfully' : 'Failed to delete note') };
    });
  }
}

// Non esporta più un'istanza singleton, verrà gestita da TypeDI
