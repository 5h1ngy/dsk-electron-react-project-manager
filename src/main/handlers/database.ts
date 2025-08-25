import { ipcMain, dialog } from 'electron';
import { exportDatabase, importDatabase } from '../database';
import fs from 'fs';

export const registerDatabaseHandlers = () => {
  // Export database to file
  ipcMain.handle('database:export', async () => {
    try {
      // Export database to encrypted Base64 string
      const encryptedData = await exportDatabase();
      
      // Open save dialog
      const { filePath } = await dialog.showSaveDialog({
        title: 'Export Database',
        defaultPath: 'project-manager-export.db',
        filters: [
          { name: 'Database Files', extensions: ['db'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      });
      
      if (!filePath) {
        return {
          success: false,
          message: 'Export cancelled'
        };
      }
      
      // Write encrypted data to file
      fs.writeFileSync(filePath, encryptedData);
      
      return {
        success: true,
        message: 'Database exported successfully'
      };
    } catch (error) {
      console.error('Error exporting database:', error);
      return {
        success: false,
        message: 'Failed to export database'
      };
    }
  });
  
  // Import database from file
  ipcMain.handle('database:import', async () => {
    try {
      // Open file dialog
      const { filePaths } = await dialog.showOpenDialog({
        title: 'Import Database',
        properties: ['openFile'],
        filters: [
          { name: 'Database Files', extensions: ['db'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      });
      
      if (!filePaths || filePaths.length === 0) {
        return {
          success: false,
          message: 'Import cancelled'
        };
      }
      
      // Read encrypted data from file
      const encryptedData = fs.readFileSync(filePaths[0], 'utf8');
      
      // Import database from encrypted Base64 string
      const result = await importDatabase(encryptedData);
      
      if (!result) {
        return {
          success: false,
          message: 'Failed to import database'
        };
      }
      
      return {
        success: true,
        message: 'Database imported successfully'
      };
    } catch (error) {
      console.error('Error importing database:', error);
      return {
        success: false,
        message: 'Failed to import database'
      };
    }
  });
};
