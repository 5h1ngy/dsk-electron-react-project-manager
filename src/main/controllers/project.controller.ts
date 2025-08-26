import { ipcMain } from 'electron';
import Container, { Inject, Service } from 'typedi';
import { ProjectService } from '../services/project.service';
import { CreateProjectDto, UpdateProjectDto, SingleProjectResponseDto } from '../dtos/project.dto';
import { BaseController } from './base.controller';
import { Logger } from '../shared/logger';

/**
 * Controller for project-related IPC operations
 */
@Service()
export class ProjectController extends BaseController {
  constructor(
    @Inject() private _projectService: ProjectService,
  ) {
    super(Container.get(Logger));
    this._logger.info('ProjectController initialized');
  }



  /**
   * Register all project IPC handlers
   */
  public registerHandlers(): void {
    // Get all projects for a user
    ipcMain.handle('projects:getAll', async (_, userId: number) => {
      this._logger.info(`IPC Handler: Getting all projects for user ${userId}`);
      return await this._projectService.getAllProjects(userId);
    });

    // Create a new project
    ipcMain.handle('projects:create', async (_, projectData: { name: string; description?: string; userId: number; tags?: number[] }) => {
      this._logger.info(`IPC Handler: Creating new project for user ${projectData.userId}`);
      const dto = new CreateProjectDto(
        projectData.name,
        projectData.description,
        projectData.userId,
        projectData.tags
      );

      // Validate dto
      const errors = dto.validate();
      if (errors.length > 0) {
        this._logger.error(`Validation errors: ${JSON.stringify(errors)}`);
        return new SingleProjectResponseDto(false, 'Validation failed: ' + errors.join(', '));
      }

      return await this._projectService.createProject(dto);
    });

    // Update a project
    ipcMain.handle('projects:update', async (_, projectId: number, updateData: UpdateProjectDto) => {
      this._logger.info(`IPC Handler: Updating project ${projectId}`);

      return await this._projectService.updateProject(projectId, updateData);
    });

    // Delete a project
    ipcMain.handle('projects:delete', async (_, projectId: number) => {
      this._logger.info(`IPC Handler: Deleting project ${projectId}`);
      return await this._projectService.deleteProject(projectId);
    });

    // Get project details
    ipcMain.handle('projects:getDetails', async (_, projectId: number) => {
      this._logger.info(`IPC Handler: Getting details for project ${projectId}`);
      return await this._projectService.getProjectDetails(projectId);
    });
  }
}

// Non esporta più un'istanza singleton, verrà gestita da TypeDI
