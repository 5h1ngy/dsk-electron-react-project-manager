import { Inject, Service } from 'typedi';

import { DatabaseConfig } from '../config/database.config';
import { BaseController } from './base.controller';
import { AuthController } from './auth.controller';
import { DatabaseController } from './database.controller';
import { ProjectController } from './project.controller';
import { TaskController } from './task.controller';
import { NoteController } from './note.controller';

import * as _logger from '../shared/logger';

@Service()
export class ControllerRegistry {
  private controllers: BaseController[] = [];

  constructor(
    @Inject()
    private _databaseConfig: DatabaseConfig,
    @Inject()
    private _authController: AuthController,
    @Inject()
    private _databaseController: DatabaseController,
    @Inject()
    private _projectController: ProjectController,
    @Inject()
    private _taskController: TaskController,
    @Inject()
    private _noteController: NoteController,
  ) {
    _logger.info('Initializing Controller Registry manually');

    this.controllers = [
      this._authController,
      this._databaseController,
      this._projectController,
      this._taskController,
      this._noteController
    ];

    _logger.info(`Initialized ${this.controllers.length} controllers`);
  }

  public async registerAllHandlers(): Promise<void> {
    await this._databaseConfig.connect()

    _logger.info('Registering all IPC handlers');
    for (const controller of this.controllers) {
      controller.registerHandlers();
    }
    
    _logger.info(`Registered handlers for ${this.controllers.length} controllers`);
  }
}
