import { ipcMain } from 'electron';
import noteService from '../services/note.service';

/**
 * Controller for note-related IPC operations
 */
export class NoteController {
  private static instance: NoteController;

  private constructor() {
    // Private constructor for singleton pattern
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): NoteController {
    if (!NoteController.instance) {
      NoteController.instance = new NoteController();
    }
    return NoteController.instance;
  }

  /**
   * Register all note IPC handlers
   */
  public registerHandlers(): void {
    // Get all notes for a project
    ipcMain.handle('notes:getByProject', async (_, projectId: number) => {
      return await noteService.getNotesByProject(projectId);
    });

    // Get all notes for a task
    ipcMain.handle('notes:getByTask', async (_, taskId: number) => {
      return await noteService.getNotesByTask(taskId);
    });

    // Create a new note
    ipcMain.handle('notes:create', async (_, noteData: {
      content: string;
      projectId?: number;
      taskId?: number;
      userId: number;
    }) => {
      return await noteService.createNote(noteData);
    });

    // Update a note
    ipcMain.handle('notes:update', async (_, noteId: number, content: string) => {
      return await noteService.updateNote(noteId, content);
    });

    // Delete a note
    ipcMain.handle('notes:delete', async (_, noteId: number) => {
      return await noteService.deleteNote(noteId);
    });
  }
}

export default NoteController.getInstance();
