import { ipcMain } from 'electron';
import { Service } from 'typedi';
import projectService from '../services/project.service';
import { CreateProjectDto, UpdateProjectDto, ProjectResponseDto, ProjectListResponseDto } from '../dtos/project.dto';
import { BaseController } from './base.controller';
import { logger } from '../shared/logger';

/**
 * Controller for project-related IPC operations
 */
@Service()
export class ProjectController extends BaseController {
  constructor() {
    super();
  }



  /**
   * Register all project IPC handlers
   */
  public registerHandlers(): void {
    // Get all projects for a user
    ipcMain.handle('projects:getAll', async (_, userId: number) => {
      logger.info(`Getting all projects for user ${userId}`);
      const result = await projectService.getAllProjects(userId);
      
      return new ProjectListResponseDto(
        result.success, 
        result.message, 
        result.projects.map(p => new ProjectResponseDto(
          p.id,
          p.name,
          p.description,
          p.userId,
          p.tags,
          p.createdAt,
          p.updatedAt
        ))
      );
    });

    // Create a new project
    ipcMain.handle('projects:create', async (_, projectData: { name: string; description?: string; userId: number; tags?: number[] }) => {
      logger.info(`Creating new project for user ${projectData.userId}`);      
      const dto = new CreateProjectDto(
        projectData.name,
        projectData.description,
        projectData.userId,
        projectData.tags
      );
      
      // Validate dto
      const errors = dto.validate();
      if (errors.length > 0) {
        logger.error(`Validation errors: ${JSON.stringify(errors)}`);
        return { success: false, message: 'Validation failed', errors };
      }
      
      const result = await projectService.createProject(dto);
      
      if (!result.success || !result.project) {
        return { success: false, message: result.message || 'Failed to create project' };
      }
      
      return new ProjectResponseDto(
        result.project.id,
        result.project.name,
        result.project.description,
        result.project.userId,
        result.project.tags,
        result.project.createdAt,
        result.project.updatedAt
      );
    });

    // Update a project
    ipcMain.handle('projects:update', async (_, projectId: number, projectData: { name?: string; description?: string; tags?: number[] }) => {
      logger.info(`Updating project ${projectId}`);
      
      const dto = new UpdateProjectDto(
        projectData.name,
        projectData.description,
        projectData.tags
      );
      
      // Validate dto
      const errors = dto.validate();
      if (errors.length > 0) {
        logger.error(`Validation errors: ${JSON.stringify(errors)}`);
        return { success: false, message: 'Validation failed', errors };
      }
      
      const result = await projectService.updateProject(projectId, dto);
      
      if (!result.success || !result.project) {
        return { success: false, message: result.message || 'Failed to update project' };
      }
      
      return new ProjectResponseDto(
        result.project.id,
        result.project.name,
        result.project.description,
        result.project.userId,
        result.project.tags,
        result.project.createdAt,
        result.project.updatedAt
      );
    });

    // Delete a project
    ipcMain.handle('projects:delete', async (_, projectId: number) => {
      logger.info(`Deleting project ${projectId}`);
      const result = await projectService.deleteProject(projectId);
      return { success: result, message: result ? 'Project deleted successfully' : 'Failed to delete project' };
    });

    // Get project details
    ipcMain.handle('projects:getDetails', async (_, projectId: number) => {
      logger.info(`Getting details for project ${projectId}`);
      const result = await projectService.getProjectDetails(projectId);
      
      if (!result.success || !result.project) {
        return { success: false, message: result.message || 'Project not found' };
      }
      
      return new ProjectResponseDto(
        result.project.id,
        result.project.name,
        result.project.description,
        result.project.userId,
        result.project.tags,
        result.project.createdAt,
        result.project.updatedAt
      );
    });
  }
}

// Non esporta più un'istanza singleton, verrà gestita da TypeDI
