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
    },
  });

  // Initialize SQLite database
  await initializeDatabase();

  // Register IPC handlers
  registerAuthHandlers();
  registerProjectHandlers();
  registerTaskHandlers();
  registerNotesHandlers();
  registerDatabaseHandlers();

  // Determine the correct path to index.html
  // This approach works in both development and production modes
  const indexPath = join(__dirname, '../../renderer/index.html');
  const indexPathAlt = join(process.cwd(), 'dist/renderer/index.html');

  console.log('Trying to load from:', indexPath);
  console.log('Alternative path:', indexPathAlt);

  try {
    // First try the relative path from __dirname
    await mainWindow.loadFile(indexPath);
  } catch (error) {
    console.error('Failed to load from primary path, trying alternative path:', error);
    try {
      // If that fails, try the absolute path from current working directory
      await mainWindow.loadFile(indexPathAlt);
    } catch (secondError) {
      console.error('Failed to load from alternative path too:', secondError);
      // As a last resort, display an error
      mainWindow.webContents.loadURL(`data:text/html;charset=utf-8,
        <html>
          <head><title>Error Loading App</title></head>
          <body>
            <h1>Error Loading Application</h1>
            <p>Could not locate index.html</p>
            <p>Primary path: ${indexPath}</p>
            <p>Alternative path: ${indexPathAlt}</p>
          </body>
        </html>
      `);
    }
  }

  // Open DevTools in development mode
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }
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
