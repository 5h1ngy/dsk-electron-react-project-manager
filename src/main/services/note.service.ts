import { Note } from '../database/models/Note';
import { Project } from '../database/models/Project';
import { Task } from '../database/models/Task';

/**
 * Service responsible for note operations
 */
export class NoteService {
  private static instance: NoteService;

  private constructor() {
    // Private constructor for singleton pattern
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): NoteService {
    if (!NoteService.instance) {
      NoteService.instance = new NoteService();
    }
    return NoteService.instance;
  }

  /**
   * Get all notes for a project
   * @param projectId Project ID
   */
  public async getNotesByProject(projectId: number) {
    try {
      const notes = await Note.findAll({
        where: { projectId, taskId: null },
        order: [['createdAt', 'DESC']]
      });
      
      return {
        success: true,
        notes: notes.map(note => note.get({ plain: true }))
      };
    } catch (error) {
      console.error('Error fetching notes:', error);
      return {
        success: false,
        message: 'Failed to fetch notes'
      };
    }
  }

  /**
   * Get all notes for a task
   * @param taskId Task ID
   */
  public async getNotesByTask(taskId: number) {
    try {
      const notes = await Note.findAll({
        where: { taskId },
        order: [['createdAt', 'DESC']]
      });
      
      return {
        success: true,
        notes: notes.map(note => note.get({ plain: true }))
      };
    } catch (error) {
      console.error('Error fetching notes:', error);
      return {
        success: false,
        message: 'Failed to fetch notes'
      };
    }
  }

  /**
   * Create a new note
   * @param noteData Note data
   */
  public async createNote(noteData: {
    content: string;
    projectId?: number;
    taskId?: number;
    userId: number;
  }) {
    try {
      const { content, projectId, taskId, userId } = noteData;
      
      // Validate parent exists
      if (projectId) {
        const project = await Project.findByPk(projectId);
        if (!project) {
          return {
            success: false,
            message: 'Project not found'
          };
        }
      } else if (taskId) {
        const task = await Task.findByPk(taskId);
        if (!task) {
          return {
            success: false,
            message: 'Task not found'
          };
        }
      } else {
        return {
          success: false,
          message: 'Either projectId or taskId must be provided'
        };
      }
      
      // Create the note
      const note = await Note.create({
        content,
        projectId: projectId || null,
        taskId: taskId || null,
        userId
      });
      
      return {
        success: true,
        note: note.get({ plain: true })
      };
    } catch (error) {
      console.error('Error creating note:', error);
      return {
        success: false,
        message: 'Failed to create note'
      };
    }
  }

  /**
   * Update a note
   * @param noteId Note ID
   * @param content New content
   */
  public async updateNote(noteId: number, content: string) {
    try {
      // Find the note
      const note = await Note.findByPk(noteId);
      if (!note) {
        return {
          success: false,
          message: 'Note not found'
        };
      }
      
      // Update content
      note.content = content;
      await note.save();
      
      return {
        success: true,
        note: note.get({ plain: true })
      };
    } catch (error) {
      console.error('Error updating note:', error);
      return {
        success: false,
        message: 'Failed to update note'
      };
    }
  }

  /**
   * Delete a note
   * @param noteId Note ID
   */
  public async deleteNote(noteId: number) {
    try {
      // Find the note
      const note = await Note.findByPk(noteId);
      if (!note) {
        return {
          success: false,
          message: 'Note not found'
        };
      }
      
      // Delete the note
      await note.destroy();
      
      return {
        success: true
      };
    } catch (error) {
      console.error('Error deleting note:', error);
      return {
        success: false,
        message: 'Failed to delete note'
      };
    }
  }
}

export default NoteService.getInstance();
