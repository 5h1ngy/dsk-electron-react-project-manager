import Container, { Service } from 'typedi';

import { Note } from '../models/Note';
import { Project } from '../models/Project';
import { Task } from '../models/Task';
import { Logger } from '../shared/logger';
import { CreateNoteDto, NoteListResponseDto, NoteResponseDto, SingleNoteResponseDto, UpdateNoteDto } from '../dtos/note.dto';
import { BaseService } from './base.service';

@Service()
export class NoteService extends BaseService {

  constructor() {
    super(Container.get(Logger));
    this._logger.info('NoteService initialized');
  }

  public async getNotesByProject(projectId: number): Promise<NoteListResponseDto> {
    try {
      this._logger.info(`Fetching notes for project ${projectId}`);

      const notes = await Note.findAll({
        where: { projectId, taskId: null },
        order: [['createdAt', 'DESC']]
      });

      const mappedNotes = notes.map(note => new NoteResponseDto(
        note.id,
        note.content,
        note.userId,
        note.projectId,
        note.taskId,
        note.createdAt,
        note.updatedAt,
        note.title,
      ));

      this._logger.info(`Retrieved ${mappedNotes.length} notes for project ${projectId}`);
      return new NoteListResponseDto(true, 'Notes retrieved successfully', mappedNotes, notes.length);
    } catch (error) {
      this.handleError(`Error fetching notes for project ${projectId}`, error);
      return new NoteListResponseDto(false, 'Failed to fetch notes', []);
    }
  }

  public async getNotesByTask(taskId: number): Promise<NoteListResponseDto> {
    try {
      this._logger.info(`Fetching notes for task ${taskId}`);

      const notes = await Note.findAll({
        where: { taskId },
        order: [['createdAt', 'DESC']]
      });

      const mappedNotes = notes.map(note => new NoteResponseDto(
        note.id,
        note.content || null,
        note.userId || 0,
        note.projectId || null,
        note.taskId || null,
        note.createdAt || new Date(),
        note.updatedAt || new Date(),
        note.title || null
      ));

      this._logger.info(`Retrieved ${mappedNotes.length} notes for task ${taskId}`);
      return new NoteListResponseDto(true, 'Notes retrieved successfully', mappedNotes, notes.length);
    } catch (error) {
      this.handleError(`Error fetching notes for task ${taskId}`, error);
      return new NoteListResponseDto(false, 'Failed to fetch notes', []);
    }
  }

  public async createNote(createNoteDto: CreateNoteDto): Promise<SingleNoteResponseDto> {
    try {
      const { content, projectId, taskId, userId } = createNoteDto;

      this._logger.info(`Creating note for user ${userId}, project: ${projectId}, task: ${taskId}`);

      // Validate parent exists
      if (projectId) {
        const project = await Project.findByPk(projectId);
        if (!project) {
          this._logger.warn(`Project ${projectId} not found when creating note`);
          return new SingleNoteResponseDto(false, 'Project not found');
        }
      } else if (taskId) {
        const task = await Task.findByPk(taskId);
        if (!task) {
          this._logger.warn(`Task ${taskId} not found when creating note`);
          return new SingleNoteResponseDto(false, 'Task not found');
        }
      } else {
        this._logger.warn('Neither projectId nor taskId provided when creating note');
        return new SingleNoteResponseDto(false, 'Either projectId or taskId must be provided');
      }

      // Create the note
      const noteCreate = {
        content: content || null,
        projectId: projectId || null,
        taskId: taskId || null,
        userId,
        title: null
      };

      const note = await Note.create(noteCreate as any);

      this._logger.info(`Note created with ID ${note.id}`);

      const noteDto = new NoteResponseDto(
        note.id,
        note.content,
        note.userId,
        note.projectId,
        note.taskId,
        note.createdAt,
        note.updatedAt,
        note.title
      );
      
      return new SingleNoteResponseDto(true, 'Note updated successfully', noteDto);
    } catch (error) {
      this.handleError('Error creating note', error);
      return new SingleNoteResponseDto(false, 'Failed to create note');
    }
  }

  public async updateNote(noteId: number, updateNoteDto: UpdateNoteDto): Promise<SingleNoteResponseDto> {
    try {
      this._logger.info(`Updating note ${noteId}`);

      // Find the note
      const note = await Note.findByPk(noteId);
      if (!note) {
        this._logger.warn(`Note ${noteId} not found during update attempt`);
        return new SingleNoteResponseDto(false, 'Note not found');
      }

      // Update content
      note.content = updateNoteDto.content || null;
      await note.save();

      this._logger.info(`Note ${noteId} updated successfully`);

      const noteDto = new NoteResponseDto(
        note.id,
        note.content,
        note.userId,
        note.projectId,
        note.taskId,
        note.createdAt,
        note.updatedAt,
        note.title
      );
      
      return new SingleNoteResponseDto(true, 'Note updated successfully', noteDto);
    } catch (error) {
      this.handleError(`Error updating note ${noteId}`, error);
      return new SingleNoteResponseDto(false, 'Failed to update note');
    }
  }

  public async deleteNote(noteId: number): Promise<SingleNoteResponseDto> {
    try {
      this._logger.info(`Deleting note ${noteId}`);

      // Find the note
      const note = await Note.findByPk(noteId);
      if (!note) {
        this._logger.warn(`Note ${noteId} not found during delete attempt`);
        return new SingleNoteResponseDto(false, 'Note not found');
      }

      // Delete the note
      await note.destroy();

      this._logger.info(`Note ${noteId} deleted successfully`);
      return new SingleNoteResponseDto(true, 'Note deleted successfully');
    } catch (error) {
      this.handleError(`Error deleting note ${noteId}`, error);
      return new SingleNoteResponseDto(false, 'Failed to delete note');
    }
  }
}
