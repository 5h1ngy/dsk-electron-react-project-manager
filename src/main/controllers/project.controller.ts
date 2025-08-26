import { ipcMain } from 'electron';
import projectService from '../services/project.service';

/**
 * Controller for project-related IPC operations
 */
export class ProjectController {
  private static instance: ProjectController;

  private constructor() {
    // Private constructor for singleton pattern
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): ProjectController {
    if (!ProjectController.instance) {
      ProjectController.instance = new ProjectController();
    }
    return ProjectController.instance;
  }

  /**
   * Register all project IPC handlers
   */
  public registerHandlers(): void {
    // Get all projects for a user
    ipcMain.handle('projects:getAll', async (_, userId: number) => {
      return await projectService.getAllProjects(userId);
    });

    // Create a new project
    ipcMain.handle('projects:create', async (_, projectData: { name: string; description?: string; userId: number; tags?: number[] }) => {
      return await projectService.createProject(projectData);
    });

    // Update a project
    ipcMain.handle('projects:update', async (_, projectId: number, projectData: { name?: string; description?: string; tags?: number[] }) => {
      return await projectService.updateProject(projectId, projectData);
    });

    // Delete a project
    ipcMain.handle('projects:delete', async (_, projectId: number) => {
      return await projectService.deleteProject(projectId);
    });

    // Get project details
    ipcMain.handle('projects:getDetails', async (_, projectId: number) => {
      return await projectService.getProjectDetails(projectId);
    });
  }
}

export default ProjectController.getInstance();
