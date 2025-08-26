import { ipcMain } from 'electron';
import taskService from '../services/task.service';

/**
 * Controller for task-related IPC operations
 */
export class TaskController {
  private static instance: TaskController;

  private constructor() {
    // Private constructor for singleton pattern
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): TaskController {
    if (!TaskController.instance) {
      TaskController.instance = new TaskController();
    }
    return TaskController.instance;
  }

  /**
   * Register all task IPC handlers
   */
  public registerHandlers(): void {
    // Get all tasks for a project
    ipcMain.handle('tasks:getByProject', async (_, projectId: number) => {
      return await taskService.getTasksByProject(projectId);
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
      return await taskService.createTask(taskData);
    });

    // Update a task
    ipcMain.handle('tasks:update', async (_, taskId: number, taskData: {
      title?: string;
      description?: string;
      status?: string;
      priority?: string;
      dueDate?: string | null;
    }) => {
      return await taskService.updateTask(taskId, taskData);
    });

    // Delete a task
    ipcMain.handle('tasks:delete', async (_, taskId: number) => {
      return await taskService.deleteTask(taskId);
    });

    // Get task details
    ipcMain.handle('tasks:getDetails', async (_, taskId: number) => {
      return await taskService.getTaskDetails(taskId);
    });

    // Update multiple task statuses
    ipcMain.handle('tasks:updateStatuses', async (_, taskIds: number[], status: string) => {
      return await taskService.updateTaskStatuses(taskIds, status);
    });
  }
}

export default TaskController.getInstance();
