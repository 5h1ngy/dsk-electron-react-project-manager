import { ipcMain } from 'electron';
import { Inject, Service } from 'typedi';

import { BaseController } from './base.controller';
import { DatabaseService } from '../services/database.service';
import { ImportDatabaseRequestDTO, ExportDatabaseResponseDTO, ImportDatabaseResponseDTO } from '../dtos/auth.dto';
import * as _logger from '../shared/logger';

@Service()
export class DatabaseController extends BaseController {

  constructor(
    @Inject() private _databaseService: DatabaseService,
  ) {
    super();
  }

  public registerHandlers(): void {
    _logger.info('Registering database handlers...');

    ipcMain.handle('database:export', async () => {
      try {
        _logger.info('Database export request received');
        const data = await this._databaseService.exportDatabase();

        _logger.info('Database exported successfully');
        const response = new ExportDatabaseResponseDTO(true, data, 'Database exported successfully');

        return response;
      } catch (error) {
        _logger.error(`Error exporting database: ${error instanceof Error ? error.message : String(error)}`);
        return new ExportDatabaseResponseDTO(false, undefined, 'Failed to export database');
      }
    });

    ipcMain.handle('database:import', async (_, importData: ImportDatabaseRequestDTO) => {
      try {
        _logger.info('Database import request received');
        const recordCount = await this._databaseService.importDatabase(importData.data);

        _logger.info(`Database imported successfully with ${recordCount} records`);
        const count = typeof recordCount === 'boolean' ? 0 : recordCount;
        return new ImportDatabaseResponseDTO(true, 'Database imported successfully', count);
        
      } catch (error) {
        _logger.error(`Error importing database: ${error instanceof Error ? error.message : String(error)}`);
        return new ImportDatabaseResponseDTO(false, 'Failed to import database');
      }
    });

    _logger.info('Database handlers registered successfully');
  }
}
