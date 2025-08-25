import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import { join } from 'path';
import { initialize as initializeDatabase } from './database';
import { registerAuthHandlers } from './handlers/auth';
import { registerProjectHandlers } from './handlers/projects';
import { registerTaskHandlers } from './handlers/tasks';
import { registerNotesHandlers } from './handlers/notes';
import { registerDatabaseHandlers } from './handlers/database';

// Disable GPU Acceleration for Windows 7
if (process.platform === 'win32') {
  app.disableHardwareAcceleration();
}

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') {
  app.setAppUserModelId(app.getName());
}

let mainWindow: BrowserWindow | null = null;

async function createWindow() {
  mainWindow = new BrowserWindow({
    title: 'Project Manager',
    width: 1200,
    height: 800,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      nodeIntegration: false,
      contextIsolation: true,
    }
  });

  // Initialize SQLite database
  await initializeDatabase();

  // Register IPC handlers
  registerAuthHandlers();
  registerProjectHandlers();
  registerTaskHandlers();
  registerNotesHandlers();
  registerDatabaseHandlers();

  // Determine the correct path to index.html with electron-vite structure
  // This approach works in both development and production modes
  // Note: electron-vite outputs to the 'out' directory by default
  const indexPath = join(__dirname, '../renderer/index.html'); // Default for electron-vite
  const indexPathAlt1 = join(process.cwd(), 'out/renderer/index.html'); // Absolute path
  const indexPathAlt2 = join(__dirname, '../../out/renderer/index.html'); // Fallback

  console.log('Trying primary path:', indexPath);
  console.log('Alternative path 1:', indexPathAlt1);
  console.log('Alternative path 2:', indexPathAlt2);

  try {
    // First try the relative path from __dirname
    await mainWindow.loadFile(indexPath);
  } catch (error) {
    console.error('Failed to load from primary path, trying alternative path 1:', error);
    try {
      // If that fails, try the absolute path from current working directory
      await mainWindow.loadFile(indexPathAlt1);
    } catch (secondError) {
      console.error('Failed to load from alternative path 1, trying alternative path 2:', secondError);
      try {
        // Last attempt with a different relative path
        await mainWindow.loadFile(indexPathAlt2);
      } catch (thirdError) {
        console.error('Failed to load from all paths:', thirdError);
        // As a last resort, display an error
        mainWindow.webContents.loadURL(`data:text/html;charset=utf-8,
          <html>
            <head><title>Error Loading App</title></head>
            <body>
              <h1>Error Loading Application</h1>
              <p>Could not locate index.html</p>
              <p>Primary path: ${indexPath}</p>
              <p>Alternative path 1: ${indexPathAlt1}</p>
              <p>Alternative path 2: ${indexPathAlt2}</p>
              <p>Current directory: ${process.cwd()}</p>
              <p>__dirname: ${__dirname}</p>
            </body>
          </html>
        `);
      }
    }
  }

  // Always open DevTools for debugging
  mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Auto-updates handling would go here (could implement later)
