import { Service } from 'typedi';
import { BaseController } from './base.controller';

// Importiamo il logger singleton e altri servizi necessari
import { logger } from '../shared/logger';
import { DatabaseService } from '../services/database.service';

// Importa tutti i controller
import { AuthController } from './auth.controller';
import { DatabaseController } from './database.controller';
import { ProjectController } from './project.controller';
import { TaskController } from './task.controller';
import { NoteController } from './note.controller';

/**
 * Registry for all controllers
 */
@Service()
export class ControllerRegistry {
  private static instance: ControllerRegistry;
  private controllers: BaseController[] = [];
  
  // Controller instances
  private authController: AuthController;
  private databaseController: DatabaseController;
  private projectController: ProjectController;
  private taskController: TaskController;
  private noteController: NoteController;

  private constructor() {
    logger.info('Initializing Controller Registry manually');
    
    // Creiamo manualmente le istanze dei controller
    this.authController = new AuthController();
    // Per DatabaseController serve l'istanza di DatabaseService
    const databaseService = DatabaseService.getInstance();
    this.databaseController = new DatabaseController(databaseService);
    this.projectController = new ProjectController();
    this.taskController = new TaskController();
    this.noteController = new NoteController();
    
    // Initialize controllers array
    this.controllers = [
      this.authController,
      this.databaseController,
      this.projectController,
      this.taskController,
      this.noteController
    ];
    logger.info(`Initialized ${this.controllers.length} controllers`);
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
   * Register all IPC handlers
   */
  public registerAllHandlers(): void {
    logger.info('Registering all IPC handlers');
    for (const controller of this.controllers) {
      controller.registerHandlers();
    }
    logger.info(`Registered handlers for ${this.controllers.length} controllers`);
  }
}

// Non esportiamo un'istanza singleton, verrà gestita da TypeDI
