import { ipcMain } from 'electron';
import { Inject, Service } from 'typedi';
import { TaskService } from '../services/task.service';
import { CreateTaskDto, UpdateTaskDto, TaskStatus, TaskPriority, BulkUpdateTaskStatusDto, SingleTaskResponseDto } from '../dtos/task.dto';
import { BaseController } from './base.controller';
import { Logger } from '../shared/logger';

/**
 * Controller for task-related IPC operations
 */
@Service()
export class TaskController extends BaseController {
  constructor(
    @Inject()
    private _taskService: TaskService,
    @Inject()
    logger: Logger
  ) {
    super(logger);
    this._logger.info('TaskController initialized');
  }



  /**
   * Register all task IPC handlers
   */
  public registerHandlers(): void {
    // Get all tasks for a project
    ipcMain.handle('tasks:getByProject', async (_, projectId: number) => {
      this._logger.info(`IPC Handler: Getting tasks for project ${projectId}`);
      return await this._taskService.getTasksByProject(projectId);
    });

    // Create a new task
    ipcMain.handle('tasks:create', async (_, taskData: {
      title: string;
      description?: string;
      status: string;
      priority: string;
      dueDate?: string;
      projectId: number;
    }) => {
      this._logger.info(`IPC Handler: Creating new task for project ${taskData.projectId}`);
      
      const dto = new CreateTaskDto(
        taskData.title,
        taskData.description,
        taskData.status as TaskStatus,
        taskData.priority as TaskPriority,
        taskData.dueDate,
        taskData.projectId
      );
      
      // Validate dto
      const errors = dto.validate();
      if (errors.length > 0) {
        this._logger.error(`Validation errors: ${JSON.stringify(errors)}`);
        return new SingleTaskResponseDto(false, 'Validation failed: ' + errors.join(', '));
      }
      
      return await this._taskService.createTask(dto);
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
      this._logger.info(`IPC Handler: Updating task ${taskId}`);
      
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
        this._logger.error(`Validation errors: ${JSON.stringify(errors)}`);
        return new SingleTaskResponseDto(false, 'Validation failed: ' + errors.join(', '));
      }
      
      return await this._taskService.updateTask(taskId, dto);
    });

    // Delete a task
    ipcMain.handle('tasks:delete', async (_, taskId: number) => {
      this._logger.info(`IPC Handler: Deleting task ${taskId}`);
      return await this._taskService.deleteTask(taskId);
    });

    // Get task details
    ipcMain.handle('tasks:getDetails', async (_, taskId: number) => {
      this._logger.info(`IPC Handler: Getting details for task ${taskId}`);
      return await this._taskService.getTaskDetails(taskId);
    });

    // Update multiple task statuses at once
    ipcMain.handle('tasks:updateStatuses', async (_, bulkUpdateData: {
      taskIds: number[];
      status: string;
    }) => {
      this._logger.info(`IPC Handler: Updating status to ${bulkUpdateData.status} for ${bulkUpdateData.taskIds.length} tasks`);
      
      const dto = new BulkUpdateTaskStatusDto(
        bulkUpdateData.taskIds,
        bulkUpdateData.status as TaskStatus
      );
      
      // Validate dto
      const errors = dto.validate();
      if (errors.length > 0) {
        this._logger.error(`Validation errors: ${JSON.stringify(errors)}`);
        return new SingleTaskResponseDto(false, 'Validation failed: ' + errors.join(', '));
      }
      
      return await this._taskService.updateTaskStatuses(bulkUpdateData.taskIds, bulkUpdateData.status as TaskStatus);
    });
  }
}

// Non esporta più un'istanza singleton, verrà gestita da TypeDI
