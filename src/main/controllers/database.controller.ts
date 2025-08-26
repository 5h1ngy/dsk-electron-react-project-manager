import { ipcMain } from 'electron';
import { Service } from 'typedi';
import { BaseController } from './base.controller';
import { DatabaseService } from '../services/database.service';
import { ImportDatabaseRequestDto, ExportDatabaseResponseDto, ImportDatabaseResponseDto } from '../dtos/auth.dto';
import { logger } from '../shared/logger';

/**
 * Controller for database-related IPC operations
 */
@Service()
export class DatabaseController extends BaseController {

  private databaseService: DatabaseService;
  
  constructor(databaseService: DatabaseService) {
    super();
    this.databaseService = databaseService;
  }

  /**
   * Register all database IPC handlers
   */
  public registerHandlers(): void {
    logger.info('Registering database handlers...');

    // Export database
    ipcMain.handle('database:export', async () => {
      try {
        logger.info('Database export request received');
        const data = await this.databaseService.exportDatabase();
        logger.info('Database exported successfully');
        
        const response = new ExportDatabaseResponseDto(true, data, 'Database exported successfully');
        return response;
      } catch (error) {
        logger.error(`Error exporting database: ${error instanceof Error ? error.message : String(error)}`);
        return new ExportDatabaseResponseDto(false, undefined, 'Failed to export database');
      }
    });
    
    // Import database
    ipcMain.handle('database:import', async (_, importData: ImportDatabaseRequestDto) => {
      try {
        logger.info('Database import request received');
        const recordCount = await this.databaseService.importDatabase(importData.data);
        logger.info(`Database imported successfully with ${recordCount} records`);
        
        // Assicuriamoci che recordCount sia un numero
        const count = typeof recordCount === 'boolean' ? 0 : recordCount;
        return new ImportDatabaseResponseDto(true, 'Database imported successfully', count);
      } catch (error) {
        logger.error(`Error importing database: ${error instanceof Error ? error.message : String(error)}`);
        return new ImportDatabaseResponseDto(false, 'Failed to import database');
      }
    });
    
    logger.info('Database handlers registered successfully');
  }
}

// La classe è già esportata tramite il decoratore @Service
