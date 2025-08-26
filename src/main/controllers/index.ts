import { Controller } from '../types';
import authController from './auth.controller';
import databaseController from './database.controller';
import projectController from './project.controller';
import taskController from './task.controller';
import noteController from './note.controller';
import databaseCleanupController from './database-cleanup.controller';

/**
 * Registry for all controllers
 */
export class ControllerRegistry {
  private static instance: ControllerRegistry;
  private controllers: Controller[] = [];

  private constructor() {
    // Initialize controllers
    this.controllers = [
      authController,
      databaseController,
      projectController,
      taskController,
      noteController,
      databaseCleanupController
    ];
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): ControllerRegistry {
    if (!ControllerRegistry.instance) {
      ControllerRegistry.instance = new ControllerRegistry();
    }
    return ControllerRegistry.instance;
  }

  /**
   * Register all handlers for all controllers
   */
  public registerAllHandlers(): void {
    console.log('Registering all IPC handlers...');
    for (const controller of this.controllers) {
      controller.registerHandlers();
    }
    console.log('All IPC handlers registered successfully');
  }
}

export default ControllerRegistry.getInstance();
