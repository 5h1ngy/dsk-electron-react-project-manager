import { ipcMain } from 'electron';
import { Task, TaskStatus, TaskPriority } from '../database/models/Task';
import { Tag } from '../database/models/Tag';
import { Attachment } from '../database/models/Attachment';
import { Op, Transaction } from 'sequelize';
import { getSequelize } from '../database';
import path from 'path';
import fs from 'fs';
import { app } from 'electron';

export const registerTaskHandlers = () => {
  // Get all tasks for a project
  ipcMain.handle('tasks:getByProject', async (_, projectId: number) => {
    try {
      const tasks = await Task.findAll({
        where: { projectId },
        include: [
          {
            model: Tag,
            as: 'tags',
            through: { attributes: [] }
          },
          {
            model: Attachment,
            as: 'attachments'
          }
        ],
        order: [
          ['status', 'ASC'],
          ['position', 'ASC'],
          ['priority', 'DESC']
        ]
      });
      
      return {
        success: true,
        tasks
      };
    } catch (error) {
      console.error('Error fetching tasks:', error);
      return {
        success: false,
        message: 'Failed to fetch tasks'
      };
    }
  });
  
  // Create a new task
  ipcMain.handle('tasks:create', async (_, taskData: {
    title: string;
    description?: string;
    status: TaskStatus;
    priority: TaskPriority;
    dueDate?: Date;
    estimationDate?: Date;
    projectId: number;
    tags?: number[];
    position: number;
  }) => {
    try {
      const { title, description, status, priority, dueDate, estimationDate, projectId, tags, position } = taskData;
      
      // Create the task
      const task = await Task.create({
        title,
        description,
        status,
        priority,
        dueDate,
        estimationDate,
        projectId,
        position
      });
      
      // Add tags if provided
      if (tags && tags.length > 0) {
        const tagInstances = await Tag.findAll({
          where: {
            id: {
              [Op.in]: tags
            }
          }
        });
        
        await task.$set('tags', tagInstances);
      }
      
      // Fetch the task with its tags
      const createdTask = await Task.findByPk(task.id, {
        include: [
          {
            model: Tag,
            as: 'tags',
            through: { attributes: [] }
          },
          {
            model: Attachment,
            as: 'attachments'
          }
        ]
      });
      
      return {
        success: true,
        task: createdTask
      };
    } catch (error) {
      console.error('Error creating task:', error);
      return {
        success: false,
        message: 'Failed to create task'
      };
    }
  });
  
  // Update a task
  ipcMain.handle('tasks:update', async (_, taskData: {
    id: number;
    title?: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    dueDate?: Date | null;
    estimationDate?: Date | null;
    tags?: number[];
    position?: number;
  }) => {
    try {
      const { id, title, description, status, priority, dueDate, estimationDate, tags, position } = taskData;
      
      const task = await Task.findByPk(id);
      
      if (!task) {
        return {
          success: false,
          message: 'Task not found'
        };
      }
      
      // Update basic info
      if (title) task.title = title;
      if (description !== undefined) task.description = description;
      if (status) task.status = status;
      if (priority) task.priority = priority;
      if (dueDate !== undefined) task.dueDate = dueDate;
      if (estimationDate !== undefined) task.estimationDate = estimationDate;
      if (position !== undefined) task.position = position;
      
      await task.save();
      
      // Update tags if provided
      if (tags) {
        const tagInstances = await Tag.findAll({
          where: {
            id: {
              [Op.in]: tags
            }
          }
        });
        
        await task.$set('tags', tagInstances);
      }
      
      // Fetch the updated task with its tags and attachments
      const updatedTask = await Task.findByPk(id, {
        include: [
          {
            model: Tag,
            as: 'tags',
            through: { attributes: [] }
          },
          {
            model: Attachment,
            as: 'attachments'
          }
        ]
      });
      
      return {
        success: true,
        task: updatedTask
      };
    } catch (error) {
      console.error('Error updating task:', error);
      return {
        success: false,
        message: 'Failed to update task'
      };
    }
  });
  
  // Delete a task
  ipcMain.handle('tasks:delete', async (_, taskId: number) => {
    const sequelize = getSequelize();
    const transaction = await sequelize.transaction();
    
    try {
      const task = await Task.findByPk(taskId, { transaction });
      
      if (!task) {
        await transaction.rollback();
        return {
          success: false,
          message: 'Task not found'
        };
      }
      
      // Delete attachments first
      const attachments = await Attachment.findAll({
        where: { taskId },
        transaction
      });
      
      // Delete attachment files
      for (const attachment of attachments) {
        try {
          fs.unlinkSync(attachment.path);
        } catch (err) {
          console.error(`Error deleting attachment file: ${attachment.path}`, err);
        }
      }
      
      // Delete attachment records
      await Attachment.destroy({
        where: { taskId },
        transaction
      });
      
      // Delete the task
      await task.destroy({ transaction });
      
      await transaction.commit();
      
      return {
        success: true
      };
    } catch (error) {
      await transaction.rollback();
      console.error('Error deleting task:', error);
      return {
        success: false,
        message: 'Failed to delete task'
      };
    }
  });
  
  // Upload attachment to task
  ipcMain.handle('tasks:uploadAttachment', async (_, attachmentData: {
    taskId: number;
    filePath: string;
    fileName: string;
    mimeType: string;
  }) => {
    try {
      const { taskId, filePath, fileName, mimeType } = attachmentData;
      
      // Ensure the task exists
      const task = await Task.findByPk(taskId);
      if (!task) {
        return {
          success: false,
          message: 'Task not found'
        };
      }
      
      // Create attachment directory if it doesn't exist
      const attachmentDir = path.join(app.getPath('userData'), 'attachments');
      if (!fs.existsSync(attachmentDir)) {
        fs.mkdirSync(attachmentDir, { recursive: true });
      }
      
      // Copy file to attachment directory with unique name
      const uniqueFileName = `${Date.now()}-${fileName}`;
      const targetPath = path.join(attachmentDir, uniqueFileName);
      
      fs.copyFileSync(filePath, targetPath);
      
      // Get file size
      const stats = fs.statSync(targetPath);
      
      // Create attachment record
      const attachment = await Attachment.create({
        name: fileName,
        path: targetPath,
        mimeType,
        size: stats.size,
        taskId
      });
      
      return {
        success: true,
        attachment
      };
    } catch (error) {
      console.error('Error uploading attachment:', error);
      return {
        success: false,
        message: 'Failed to upload attachment'
      };
    }
  });
  
  // Delete attachment
  ipcMain.handle('tasks:deleteAttachment', async (_, attachmentId: number) => {
    try {
      const attachment = await Attachment.findByPk(attachmentId);
      
      if (!attachment) {
        return {
          success: false,
          message: 'Attachment not found'
        };
      }
      
      // Delete file
      try {
        fs.unlinkSync(attachment.path);
      } catch (err) {
        console.error(`Error deleting attachment file: ${attachment.path}`, err);
      }
      
      // Delete record
      await attachment.destroy();
      
      return {
        success: true
      };
    } catch (error) {
      console.error('Error deleting attachment:', error);
      return {
        success: false,
        message: 'Failed to delete attachment'
      };
    }
  });
  
  // Get attachment file
  ipcMain.handle('tasks:getAttachment', async (_, attachmentId: number) => {
    try {
      const attachment = await Attachment.findByPk(attachmentId);
      
      if (!attachment) {
        return {
          success: false,
          message: 'Attachment not found'
        };
      }
      
      // Read file data
      const fileData = fs.readFileSync(attachment.path);
      
      return {
        success: true,
        attachment: {
          id: attachment.id,
          name: attachment.name,
          mimeType: attachment.mimeType,
          size: attachment.size,
          data: fileData.toString('base64')
        }
      };
    } catch (error) {
      console.error('Error getting attachment:', error);
      return {
        success: false,
        message: 'Failed to get attachment'
      };
    }
  });
};
