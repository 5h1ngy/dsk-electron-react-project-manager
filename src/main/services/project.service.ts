import { Project } from '../database/models/Project';
import { Tag } from '../database/models/Tag';
import { Task } from '../database/models/Task';
import { Op, Sequelize } from 'sequelize';

/**
 * Service responsible for project operations
 */
export class ProjectService {
  private static instance: ProjectService;

  private constructor() {
    // Private constructor for singleton pattern
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): ProjectService {
    if (!ProjectService.instance) {
      ProjectService.instance = new ProjectService();
    }
    return ProjectService.instance;
  }

  /**
   * Get all projects for a user
   * @param userId User ID
   */
  public async getAllProjects(userId: number) {
    try {
      // Check if userId is defined and valid
      if (!userId || isNaN(userId)) {
        return {
          success: false,
          message: 'Invalid user ID',
          projects: []
        };
      }
      
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
      
      // Convert projects to plain JavaScript objects
      const plainProjects = projects.map(project => project.get({ plain: true }));
      
      return {
        success: true,
        projects: plainProjects
      };
    } catch (error) {
      console.error('Error fetching projects:', error);
      return {
        success: false,
        message: 'Failed to fetch projects'
      };
    }
  }

  /**
   * Create a new project
   * @param projectData Project data
   */
  public async createProject(projectData: { name: string; description?: string; userId: number; tags?: number[] }) {
    try {
      const { name, description, userId, tags } = projectData;
      
      // Create the project
      const project = await Project.create({
        name,
        description: description || '',
        userId
      });
      
      // Add tags if provided
      if (tags && tags.length > 0) {
        await project.$add('tags', tags);
      }
      
      // Get the updated project with tags
      const updatedProject = await Project.findByPk(project.id, {
        include: [{
          model: Tag,
          as: 'tags',
          through: { attributes: [] }
        }]
      });
      
      return {
        success: true,
        project: updatedProject?.get({ plain: true })
      };
    } catch (error) {
      console.error('Error creating project:', error);
      return {
        success: false,
        message: 'Failed to create project'
      };
    }
  }

  /**
   * Update a project
   * @param projectId Project ID
   * @param projectData Project data
   */
  public async updateProject(projectId: number, projectData: { name?: string; description?: string; tags?: number[] }) {
    try {
      const { name, description, tags } = projectData;
      
      // Find the project
      const project = await Project.findByPk(projectId);
      if (!project) {
        return {
          success: false,
          message: 'Project not found'
        };
      }
      
      // Update fields
      if (name !== undefined) project.name = name;
      if (description !== undefined) project.description = description;
      
      await project.save();
      
      // Update tags if provided
      if (tags !== undefined) {
        await project.$set('tags', tags);
      }
      
      // Get the updated project with tags
      const updatedProject = await Project.findByPk(project.id, {
        include: [{
          model: Tag,
          as: 'tags',
          through: { attributes: [] }
        }]
      });
      
      return {
        success: true,
        project: updatedProject?.get({ plain: true })
      };
    } catch (error) {
      console.error('Error updating project:', error);
      return {
        success: false,
        message: 'Failed to update project'
      };
    }
  }

  /**
   * Delete a project
   * @param projectId Project ID
   */
  public async deleteProject(projectId: number) {
    try {
      // Find the project
      const project = await Project.findByPk(projectId);
      if (!project) {
        return {
          success: false,
          message: 'Project not found'
        };
      }
      
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
  }

  /**
   * Get project details
   * @param projectId Project ID
   */
  public async getProjectDetails(projectId: number) {
    try {
      const project = await Project.findByPk(projectId, {
        include: [
          {
            model: Tag,
            as: 'tags',
            through: { attributes: [] }
          },
          {
            model: Task,
            as: 'tasks'
          }
        ]
      });
      
      if (!project) {
        return {
          success: false,
          message: 'Project not found'
        };
      }
      
      return {
        success: true,
        project: project.get({ plain: true })
      };
    } catch (error) {
      console.error('Error fetching project details:', error);
      return {
        success: false,
        message: 'Failed to fetch project details'
      };
    }
  }
}

export default ProjectService.getInstance();
