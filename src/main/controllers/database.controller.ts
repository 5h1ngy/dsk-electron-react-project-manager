import { ipcMain } from 'electron';
import Container, { Inject, Service } from 'typedi';

import { BaseController } from './base.controller';
import { DatabaseService } from '../services/database.service';
import { ImportDatabaseRequestDTO, ExportDatabaseResponseDTO, ImportDatabaseResponseDTO } from '../dtos/auth.dto';
import { Logger } from '../shared/logger';

@Service()
export class DatabaseController extends BaseController {

  constructor(
    @Inject()
    private _databaseService: DatabaseService,
  ) {
    super(Container.get(Logger));
  }

  public registerHandlers(): void {
    this._logger.info('Registering database handlers...');

    ipcMain.handle('database:export', async () => {
      try {
        this._logger.info('Database export request received');
        const data = await this._databaseService.exportDatabase();
        this._logger.info('Database exported successfully');

        const response = new ExportDatabaseResponseDTO(true, data, 'Database exported successfully');
        return response;
      } catch (error) {
        this._logger.error(`Error exporting database: ${error instanceof Error ? error.message : String(error)}`);
        return new ExportDatabaseResponseDTO(false, undefined, 'Failed to export database');
      }
    });

    ipcMain.handle('database:import', async (_, importData: ImportDatabaseRequestDTO) => {
      try {
        this._logger.info('Database import request received');
        const recordCount = await this._databaseService.importDatabase(importData.data);
        this._logger.info(`Database imported successfully with ${recordCount} records`);

        // Assicuriamoci che recordCount sia un numero
        const count = typeof recordCount === 'boolean' ? 0 : recordCount;
        return new ImportDatabaseResponseDTO(true, 'Database imported successfully', count);
      } catch (error) {
        this._logger.error(`Error importing database: ${error instanceof Error ? error.message : String(error)}`);
        return new ImportDatabaseResponseDTO(false, 'Failed to import database');
      }
    });

    this._logger.info('Database handlers registered successfully');
  }
}
