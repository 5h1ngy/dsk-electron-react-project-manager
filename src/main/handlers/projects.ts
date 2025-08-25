import { ipcMain } from 'electron';
import { Project } from '../database/models/Project';
import { Tag } from '../database/models/Tag';
import { Task } from '../database/models/Task';
import { Op, Sequelize } from 'sequelize';

export const registerProjectHandlers = () => {
  // Get all projects for a user
  ipcMain.handle('projects:getAll', async (_, userId: number) => {
    try {
      const projects = await Project.findAll({
        where: { userId },
        include: [
          {
            model: Tag,
            as: 'tags',
            through: { attributes: [] }
          }
        ],
        order: [['updatedAt', 'DESC']]
      });
      
      return {
        success: true,
        projects
      };
    } catch (error) {
      console.error('Error fetching projects:', error);
      return {
        success: false,
        message: 'Failed to fetch projects'
      };
    }
  });
  
  // Create a new project
  ipcMain.handle('projects:create', async (_, projectData: { name: string; description?: string; userId: number; tags?: number[] }) => {
    try {
      const { name, description, userId, tags } = projectData;
      
      // Create the project
      const project = await Project.create({
        name,
        description,
        userId
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
        
        await project.addTags(tagInstances);
      }
      
      // Fetch the project with its tags
      const createdProject = await Project.findByPk(project.id, {
        include: [
          {
            model: Tag,
            as: 'tags',
            through: { attributes: [] }
          }
        ]
      });
      
      return {
        success: true,
        project: createdProject
      };
    } catch (error) {
      console.error('Error creating project:', error);
      return {
        success: false,
        message: 'Failed to create project'
      };
    }
  });
  
  // Update a project
  ipcMain.handle('projects:update', async (_, projectData: { id: number; name?: string; description?: string; tags?: number[] }) => {
    try {
      const { id, name, description, tags } = projectData;
      
      const project = await Project.findByPk(id);
      
      if (!project) {
        return {
          success: false,
          message: 'Project not found'
        };
      }
      
      // Update basic info
      if (name) project.name = name;
      if (description !== undefined) project.description = description;
      
      await project.save();
      
      // Update tags if provided
      if (tags) {
        const tagInstances = await Tag.findAll({
          where: {
            id: {
              [Op.in]: tags
            }
          }
        });
        
        await project.setTags(tagInstances);
      }
      
      // Fetch the updated project with its tags
      const updatedProject = await Project.findByPk(id, {
        include: [
          {
            model: Tag,
            as: 'tags',
            through: { attributes: [] }
          }
        ]
      });
      
      return {
        success: true,
        project: updatedProject
      };
    } catch (error) {
      console.error('Error updating project:', error);
      return {
        success: false,
        message: 'Failed to update project'
      };
    }
  });
  
  // Delete a project
  ipcMain.handle('projects:delete', async (_, projectId: number) => {
    try {
      const project = await Project.findByPk(projectId);
      
      if (!project) {
        return {
          success: false,
          message: 'Project not found'
        };
      }
      
      // Delete associated tasks first (to avoid foreign key constraints)
      await Task.destroy({ where: { projectId } });
      
      // Delete the project
      await project.destroy();
      
      return {
        success: true
      };
    } catch (error) {
      console.error('Error deleting project:', error);
      return {
        success: false,
        message: 'Failed to delete project'
      };
    }
  });
  
  // Get project stats
  ipcMain.handle('projects:getStats', async (_, projectId: number) => {
    try {
      const taskStats = await Task.findAll({
        attributes: [
          'status',
          [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
        ],
        where: { projectId },
        group: ['status']
      });
      
      const tasksByPriority = await Task.findAll({
        attributes: [
          'priority',
          [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
        ],
        where: { projectId },
        group: ['priority']
      });
      
      return {
        success: true,
        stats: {
          byStatus: taskStats,
          byPriority: tasksByPriority
        }
      };
    } catch (error) {
      console.error('Error fetching project stats:', error);
      return {
        success: false,
        message: 'Failed to fetch project statistics'
      };
    }
  });
};
