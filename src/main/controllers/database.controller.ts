import { ipcMain } from 'electron';
import databaseService from '../services/database.service';
import { ImportDatabaseRequestDto } from '../dtos/auth.dto';

/**
 * Controller for database-related IPC operations
 */
export class DatabaseController {
  private static instance: DatabaseController;

  private constructor() {
    // Private constructor for singleton pattern
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): DatabaseController {
    if (!DatabaseController.instance) {
      DatabaseController.instance = new DatabaseController();
    }
    return DatabaseController.instance;
  }

  /**
   * Register all database IPC handlers
   */
  public registerHandlers(): void {
    // Export database
    ipcMain.handle('database:export', async () => {
      try {
        const data = await databaseService.exportDatabase();
        return {
          success: true,
          data
        };
      } catch (error) {
        console.error('Error exporting database:', error);
        return {
          success: false,
          message: 'Failed to export database'
        };
      }
    });
    
    // Import database
    ipcMain.handle('database:import', async (_, importData: ImportDatabaseRequestDto) => {
      try {
        const success = await databaseService.importDatabase(importData.data);
        return {
          success,
          message: success ? 'Database imported successfully' : 'Failed to import database'
        };
      } catch (error) {
        console.error('Error importing database:', error);
        return {
          success: false,
          message: 'Failed to import database'
        };
      }
    });
  }
}

export default DatabaseController.getInstance();
