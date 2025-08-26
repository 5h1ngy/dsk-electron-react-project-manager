import { ipcMain } from 'electron';
import databaseCleanupService from '../services/database-cleanup.service';

/**
 * Controller for database cleanup operations
 */
export class DatabaseCleanupController {
  private static instance: DatabaseCleanupController;

  private constructor() {
    // Private constructor for singleton pattern
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): DatabaseCleanupController {
    if (!DatabaseCleanupController.instance) {
      DatabaseCleanupController.instance = new DatabaseCleanupController();
    }
    return DatabaseCleanupController.instance;
  }

  /**
   * Register all database cleanup IPC handlers
   */
  public registerHandlers(): void {
    // Cleanup database
    ipcMain.handle('database:cleanup', async () => {
      return await databaseCleanupService.cleanupDatabase();
    });
  }
}

export default DatabaseCleanupController.getInstance();
