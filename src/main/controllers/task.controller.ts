import { ipcMain } from 'electron';
import { Service } from 'typedi';
import taskService from '../services/task.service';
import { CreateTaskDto, UpdateTaskDto, TaskResponseDto, TaskListResponseDto, TaskStatus, TaskPriority, BulkUpdateTaskStatusDto } from '../dtos/task.dto';
import { TagResponseDto } from '../dtos/tag.dto';
import { BaseController } from './base.controller';
import { logger } from '../shared/logger';

/**
 * Controller for task-related IPC operations
 */
@Service()
export class TaskController extends BaseController {
  constructor() {
    super();
  }



  /**
   * Register all task IPC handlers
   */
  public registerHandlers(): void {
    // Get all tasks for a project
    ipcMain.handle('tasks:getByProject', async (_, projectId: number) => {
      logger.info(`Getting tasks for project ${projectId}`);
      const result = await taskService.getTasksByProject(projectId);
      
      return new TaskListResponseDto(
        result.success,
        result.message,
        result.tasks?.map(t => new TaskResponseDto(
          t.id,
          t.title,
          t.description,
          t.status as TaskStatus,
          t.priority as TaskPriority,
          t.dueDate?.toString(),
          t.projectId,
          t.tags?.map(tag => new TagResponseDto(tag.id, tag.name, tag.color, tag.createdAt, tag.updatedAt)) || [],
          t.createdAt,
          t.updatedAt
        )) || []
      );
    });

    // Create a new task
    ipcMain.handle('tasks:create', async (_, taskData: {
      title: string;
      description?: string;
      status: string;
      priority: string;
      dueDate?: string;
      projectId: number;
      tags?: number[];
    }) => {
      logger.info(`Creating new task for project ${taskData.projectId}`);
      
      const dto = new CreateTaskDto(
        taskData.title,
        taskData.description,
        taskData.status as TaskStatus,
        taskData.priority as TaskPriority,
        taskData.dueDate,
        taskData.projectId,
        taskData.tags
      );
      
      // Validate dto
      const errors = dto.validate();
      if (errors.length > 0) {
        logger.error(`Validation errors: ${JSON.stringify(errors)}`);
        return { success: false, message: 'Validation failed', errors };
      }
      
      const result = await taskService.createTask(dto);
      
      if (!result.success || !result.task) {
        return { success: false, message: result.message || 'Failed to create task' };
      }
      
      return new TaskResponseDto(
        result.task.id,
        result.task.title,
        result.task.description,
        result.task.status as TaskStatus,
        result.task.priority as TaskPriority,
        result.task.dueDate?.toString(),
        result.task.projectId,
        result.task.tags?.map(tag => new TagResponseDto(tag.id, tag.name, tag.color, tag.createdAt, tag.updatedAt)) || [],
        result.task.createdAt,
        result.task.updatedAt
      );
    });

    // Update a task
    ipcMain.handle('tasks:update', async (_, taskId: number, taskData: {
      title?: string;
      description?: string;
      status?: string;
      priority?: string;
      dueDate?: string | null;
      tags?: number[];
    }) => {
      logger.info(`Updating task ${taskId}`);
      
      // Convertire dueDate da null a undefined se necessario
      const dueDate = taskData.dueDate === null ? undefined : taskData.dueDate;
      
      const dto = new UpdateTaskDto(
        taskData.title,
        taskData.description,
        taskData.status as TaskStatus | undefined,
        taskData.priority as TaskPriority | undefined,
        dueDate,
        taskData.tags
      );
      
      // Validate dto
      const errors = dto.validate();
      if (errors.length > 0) {
        logger.error(`Validation errors: ${JSON.stringify(errors)}`);
        return { success: false, message: 'Validation failed', errors };
      }
      
      const result = await taskService.updateTask(taskId, dto);
      
      if (!result.success || !result.task) {
        return { success: false, message: result.message || 'Failed to update task' };
      }
      
      return new TaskResponseDto(
        result.task.id,
        result.task.title,
        result.task.description,
        result.task.status as TaskStatus,
        result.task.priority as TaskPriority,
        result.task.dueDate?.toString(),
        result.task.projectId,
        result.task.tags?.map(tag => new TagResponseDto(tag.id, tag.name, tag.color, tag.createdAt, tag.updatedAt)) || [],
        result.task.createdAt,
        result.task.updatedAt
      );
    });

    // Delete a task
    ipcMain.handle('tasks:delete', async (_, taskId: number) => {
      logger.info(`Deleting task ${taskId}`);
      const result = await taskService.deleteTask(taskId);
      return { success: result.success, message: result.message || (result.success ? 'Task deleted successfully' : 'Failed to delete task') };
    });

    // Get task details
    ipcMain.handle('tasks:getDetails', async (_, taskId: number) => {
      logger.info(`Getting details for task ${taskId}`);
      const result = await taskService.getTaskDetails(taskId);
      
      if (!result.success || !result.task) {
        return { success: false, message: result.message || 'Task not found' };
      }
      
      return new TaskResponseDto(
        result.task.id,
        result.task.title,
        result.task.description,
        result.task.status as TaskStatus,
        result.task.priority as TaskPriority,
        result.task.dueDate?.toString(),
        result.task.projectId,
        result.task.tags?.map(tag => new TagResponseDto(tag.id, tag.name, tag.color, tag.createdAt, tag.updatedAt)) || [],
        result.task.createdAt,
        result.task.updatedAt
      );
    });

    // Update multiple task statuses
    ipcMain.handle('tasks:updateStatuses', async (_, taskIds: number[], status: string) => {
      logger.info(`Updating statuses for tasks: ${taskIds.join(', ')}`);
      
      const dto = new BulkUpdateTaskStatusDto(
        taskIds,
        status as TaskStatus
      );
      
      // Validate dto
      const errors = dto.validate();
      if (errors.length > 0) {
        logger.error(`Validation errors: ${JSON.stringify(errors)}`);
        return { success: false, message: 'Validation failed', errors };
      }
      
      return await taskService.updateTaskStatuses(taskIds, status);
    });
  }
}

// Non esporta più un'istanza singleton, verrà gestita da TypeDI
