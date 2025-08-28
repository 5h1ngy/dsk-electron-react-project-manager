import { Service } from 'typedi';

import { Task } from '../models';
import { Project } from '../models';
import { Op } from 'sequelize';
import * as _logger from '../shared/logger';
import { CreateTaskDto, TaskListResponseDto, TaskResponseDto, SingleTaskResponseDto, UpdateTaskDto, TaskStatus, TaskPriority } from '../dtos/task.dto';
import { BaseService } from './base.service';

/**
 * Service responsible for task operations
 */
@Service()
export class TaskService extends BaseService {

  /**
   * Get all tasks for a project
   * @param projectId Project ID
   */
  public async getTasksByProject(projectId: number): Promise<TaskListResponseDto> {
    try {
      _logger.info(`Fetching tasks for project ${projectId}`);

      // Check if projectId is valid
      if (!projectId || isNaN(projectId)) {
        _logger.warn(`Invalid project ID provided: ${projectId}`);
        return new TaskListResponseDto(false, 'Invalid project ID', []);
      }

      const tasks = await Task.findAll({
        where: { projectId },
        order: [
          ['status', 'ASC'],
          ['priority', 'DESC'],
          ['dueDate', 'ASC'],
          ['createdAt', 'DESC']
        ]
      });

      // Map to task response DTOs
      const taskDtos = tasks.map(task => new TaskResponseDto(
        task.id,
        task.title,
        task.description || '',
        task.status as TaskStatus,
        task.priority as TaskPriority,
        task.dueDate?.toString(),
        task.projectId,
        [], // tags field
        task.createdAt,
        task.updatedAt
      ));

      _logger.info(`Retrieved ${taskDtos.length} tasks for project ${projectId}`);
      return new TaskListResponseDto(true, 'Tasks retrieved successfully', taskDtos, tasks.length);
    } catch (error) {
      this.handleError(`Error fetching tasks for project ${projectId}`, error);
      return new TaskListResponseDto(false, 'Failed to fetch tasks', []);
    }
  }

  /**
   * Create a new task
   * @param createTaskDto The DTO containing task creation data
   */
  public async createTask(createTaskDto: CreateTaskDto): Promise<SingleTaskResponseDto> {
    try {
      const { title, description, status, priority, dueDate, projectId } = createTaskDto;

      _logger.info(`Creating task "${title}" for project ${projectId}`);

      // Validate project existence
      const project = await Project.findByPk(projectId);
      if (!project) {
        _logger.warn(`Project ${projectId} not found during task creation`);
        return new SingleTaskResponseDto(false, 'Project not found');
      }

      // Create the task
      const taskData = {
        title,
        description: description || '',
        status,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
        projectId
      };

      const task = await Task.create(taskData as any);

      // Create the response DTO
      const taskDto = new TaskResponseDto(
        task.id,
        task.title,
        task.description || '',
        task.status as TaskStatus,
        task.priority as TaskPriority,
        task.dueDate?.toString(),
        task.projectId,
        [], // No tags initially
        task.createdAt,
        task.updatedAt
      );

      _logger.info(`Task ${task.id} created successfully for project ${projectId}`);
      return new SingleTaskResponseDto(true, 'Task created successfully', taskDto);
    } catch (error) {
      this.handleError('Error creating task', error);
      return new SingleTaskResponseDto(false, 'Failed to create task');
    }
  }

  /**
   * Update a task
   * @param taskId Task ID
   * @param updateTaskDto The DTO containing task update data
   */
  public async updateTask(taskId: number, updateTaskDto: UpdateTaskDto): Promise<SingleTaskResponseDto> {
    try {
      const { title, description, status, priority, dueDate } = updateTaskDto;

      _logger.info(`Updating task ${taskId}`);

      // Find the task
      const task = await Task.findByPk(taskId);
      if (!task) {
        _logger.warn(`Task ${taskId} not found during update attempt`);
        return new SingleTaskResponseDto(false, 'Task not found');
      }

      // Update fields
      if (title !== undefined) task.title = title;
      if (description !== undefined) task.description = description;
      if (status !== undefined) task.status = status;
      if (priority !== undefined) task.priority = priority;
      if (dueDate !== undefined) {
        task.dueDate = dueDate ? new Date(dueDate) : null;
      }

      await task.save();

      // Create the response DTO
      const taskDto = new TaskResponseDto(
        task.id,
        task.title,
        task.description || '',
        task.status as TaskStatus,
        task.priority as TaskPriority,
        task.dueDate?.toString(),
        task.projectId,
        [], // No tags
        task.createdAt,
        task.updatedAt
      );

      _logger.info(`Task ${taskId} updated successfully`);
      return new SingleTaskResponseDto(true, 'Task updated successfully', taskDto);
    } catch (error) {
      this.handleError(`Error updating task ${taskId}`, error);
      return new SingleTaskResponseDto(false, 'Failed to update task');
    }
  }

  /**
   * Delete a task
   * @param taskId Task ID
   */
  public async deleteTask(taskId: number): Promise<SingleTaskResponseDto> {
    try {
      _logger.info(`Deleting task ${taskId}`);

      // Find the task
      const task = await Task.findByPk(taskId);
      if (!task) {
        _logger.warn(`Task ${taskId} not found during delete attempt`);
        return new SingleTaskResponseDto(false, 'Task not found');
      }

      // Delete the task
      await task.destroy();

      _logger.info(`Task ${taskId} deleted successfully`);
      return new SingleTaskResponseDto(true, 'Task deleted successfully');
    } catch (error) {
      this.handleError(`Error deleting task ${taskId}`, error);
      return new SingleTaskResponseDto(false, 'Failed to delete task');
    }
  }

  /**
   * Get task details
   * @param taskId Task ID
   */
  public async getTaskDetails(taskId: number): Promise<SingleTaskResponseDto> {
    try {
      _logger.info(`Getting details for task ${taskId}`);

      const task = await Task.findByPk(taskId);

      if (!task) {
        _logger.warn(`Task ${taskId} not found during details retrieval`);
        return new SingleTaskResponseDto(false, 'Task not found');
      }

      // Create the response DTO
      const taskDto = new TaskResponseDto(
        task.id,
        task.title,
        task.description || '',
        task.status as TaskStatus,
        task.priority as TaskPriority,
        task.dueDate?.toString(),
        task.projectId,
        [], // No tags
        task.createdAt,
        task.updatedAt
      );

      _logger.info(`Task ${taskId} details retrieved successfully`);
      return new SingleTaskResponseDto(true, 'Task details retrieved successfully', taskDto);
    } catch (error) {
      this.handleError(`Error fetching task details for task ${taskId}`, error);
      return new SingleTaskResponseDto(false, 'Failed to fetch task details');
    }
  }

  /**
   * Update multiple task statuses
   * @param taskIds Task IDs
   * @param status New status
   */
  public async updateTaskStatuses(taskIds: number[], status: TaskStatus): Promise<SingleTaskResponseDto> {
    try {
      _logger.info(`Updating status to ${status} for ${taskIds.length} tasks`);

      await Task.update(
        { status },
        { where: { id: { [Op.in]: taskIds } } }
      );

      _logger.info(`Status updated successfully for tasks: ${taskIds.join(', ')}`);
      return new SingleTaskResponseDto(true, 'Task statuses updated successfully');
    } catch (error) {
      this.handleError(`Error updating status for tasks: ${taskIds.join(', ')}`, error);
      return new SingleTaskResponseDto(false, 'Failed to update task statuses');
    }
  }
}
