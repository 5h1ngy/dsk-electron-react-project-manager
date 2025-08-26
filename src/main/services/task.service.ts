import { Task } from '../database/models/Task';
import { Project } from '../database/models/Project';
import { Op } from 'sequelize';

/**
 * Service responsible for task operations
 */
export class TaskService {
  private static instance: TaskService;

  private constructor() {
    // Private constructor for singleton pattern
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): TaskService {
    if (!TaskService.instance) {
      TaskService.instance = new TaskService();
    }
    return TaskService.instance;
  }

  /**
   * Get all tasks for a project
   * @param projectId Project ID
   */
  public async getTasksByProject(projectId: number) {
    try {
      const tasks = await Task.findAll({
        where: { projectId },
        order: [
          ['status', 'ASC'],
          ['priority', 'DESC'],
          ['dueDate', 'ASC'],
          ['createdAt', 'DESC']
        ]
      });
      
      return {
        success: true,
        tasks: tasks.map(task => task.get({ plain: true }))
      };
    } catch (error) {
      console.error('Error fetching tasks:', error);
      return {
        success: false,
        message: 'Failed to fetch tasks'
      };
    }
  }

  /**
   * Create a new task
   * @param taskData Task data
   */
  public async createTask(taskData: {
    title: string;
    description?: string;
    status: string;
    priority: string;
    dueDate?: string;
    projectId: number;
  }) {
    try {
      const { title, description, status, priority, dueDate, projectId } = taskData;
      
      // Validate project existence
      const project = await Project.findByPk(projectId);
      if (!project) {
        return {
          success: false,
          message: 'Project not found'
        };
      }
      
      // Create the task
      const task = await Task.create({
        title,
        description: description || '',
        status,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
        projectId
      });
      
      return {
        success: true,
        task: task.get({ plain: true })
      };
    } catch (error) {
      console.error('Error creating task:', error);
      return {
        success: false,
        message: 'Failed to create task'
      };
    }
  }

  /**
   * Update a task
   * @param taskId Task ID
   * @param taskData Task data
   */
  public async updateTask(taskId: number, taskData: {
    title?: string;
    description?: string;
    status?: string;
    priority?: string;
    dueDate?: string | null;
  }) {
    try {
      const { title, description, status, priority, dueDate } = taskData;
      
      // Find the task
      const task = await Task.findByPk(taskId);
      if (!task) {
        return {
          success: false,
          message: 'Task not found'
        };
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
      
      return {
        success: true,
        task: task.get({ plain: true })
      };
    } catch (error) {
      console.error('Error updating task:', error);
      return {
        success: false,
        message: 'Failed to update task'
      };
    }
  }

  /**
   * Delete a task
   * @param taskId Task ID
   */
  public async deleteTask(taskId: number) {
    try {
      // Find the task
      const task = await Task.findByPk(taskId);
      if (!task) {
        return {
          success: false,
          message: 'Task not found'
        };
      }
      
      // Delete the task
      await task.destroy();
      
      return {
        success: true
      };
    } catch (error) {
      console.error('Error deleting task:', error);
      return {
        success: false,
        message: 'Failed to delete task'
      };
    }
  }

  /**
   * Get task details
   * @param taskId Task ID
   */
  public async getTaskDetails(taskId: number) {
    try {
      const task = await Task.findByPk(taskId);
      
      if (!task) {
        return {
          success: false,
          message: 'Task not found'
        };
      }
      
      return {
        success: true,
        task: task.get({ plain: true })
      };
    } catch (error) {
      console.error('Error fetching task details:', error);
      return {
        success: false,
        message: 'Failed to fetch task details'
      };
    }
  }

  /**
   * Update multiple task statuses
   * @param taskIds Task IDs
   * @param status New status
   */
  public async updateTaskStatuses(taskIds: number[], status: string) {
    try {
      await Task.update(
        { status },
        { where: { id: { [Op.in]: taskIds } } }
      );
      
      return {
        success: true
      };
    } catch (error) {
      console.error('Error updating task statuses:', error);
      return {
        success: false,
        message: 'Failed to update task statuses'
      };
    }
  }
}

export default TaskService.getInstance();
