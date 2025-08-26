import { app, BrowserWindow } from 'electron';
import { join } from 'path';
import { Inject, Service } from 'typedi';

import { Logger } from './shared/logger';
import { ControllerRegistry } from './controllers';

@Service()
export class Application {
  private mainWindow: BrowserWindow | null = null;

  constructor(
    @Inject()
    private _logger: Logger,
    private _controllerRegistry: ControllerRegistry
  ) {
    this._logger.info('Application class instantiated - direct logger usage');
    this.init()
  }

  public async init(): Promise<void> {
    try {
      this.configureForWindows();
      this.registerAppEvents();

      this._controllerRegistry.registerAllHandlers();

      this._logger.info('Application initialized successfully');
    } catch (error) {
      this._logger.error(`Error initializing application: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private configureForWindows(): void {
    if (process.platform === 'win32') {
      app.disableHardwareAcceleration();
      app.setAppUserModelId(app.getName());
    }
  }

  private registerAppEvents(): void {
    app.whenReady().then(() => {
      this.createWindow();

      app.on('will-quit', async () => {
        this._logger.info('App will quit');
      });

      app.on('activate', () => {
        // Su macOS è comune ricreare una finestra quando
        // l'icona nel dock viene cliccata e non ci sono altre finestre aperte
        if (BrowserWindow.getAllWindows().length === 0) {
          this.createWindow();
        }
      });
    });

    // Evento window-all-closed
    app.on('window-all-closed', () => {
      this._logger.info('All windows closed, quitting app');
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });
  }

  private async createWindow(): Promise<void> {
    this._logger.info('Creating main window...');
    this.mainWindow = new BrowserWindow({
      title: 'Project Manager',
      width: 1200,
      height: 800,
      webPreferences: {
        preload: join(__dirname, '../preload/index.js'),
        nodeIntegration: false,
        contextIsolation: true,
        webSecurity: true,
      }
    });

    this._logger.info('Main window created successfully');
    this.configureContentSecurityPolicy();

    try {
      this._logger.info('Registering IPC handlers...');
      this._controllerRegistry.registerAllHandlers();
      this._logger.info('IPC handlers registered successfully');
    } catch (error: any) {
      this._logger.error(`Failed to initialize application: ${error?.message || 'Unknown error'}`);
      console.error('Failed to initialize application:', error);
    }

    await this.loadUserInterface();

    // In development mode, apre DevTools
    if (process.env.NODE_ENV === 'development') {
      this.mainWindow.webContents.openDevTools();
    }
  }

  private configureContentSecurityPolicy(): void {
    if (!this.mainWindow) return;

    this.mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          'Content-Security-Policy': ["default-src 'self'; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:;"]
        }
      });
    });
  }

  private async loadUserInterface(): Promise<void> {
    this._logger.info('Loading user interface...');
    if (!this.mainWindow) {
      this._logger.error('Cannot load user interface: main window is not created');
      return;
    }

    // Determine the correct path to index.html with electron-vite structure
    const indexPath = join(__dirname, '../renderer/index.html'); // Default for electron-vite
    const indexPathAlt1 = join(process.cwd(), 'out/renderer/index.html'); // Absolute path
    const indexPathAlt2 = join(__dirname, '../../out/renderer/index.html'); // Fallback

    console.log('Trying primary path:', indexPath);
    console.log('Alternative path 1:', indexPathAlt1);
    console.log('Alternative path 2:', indexPathAlt2);

    try {
      await this.mainWindow.loadFile(indexPath);

    } catch (error) {
      console.error('Failed to load from primary path, trying alternative path 1:', error);

      try {
        await this.mainWindow.loadFile(indexPathAlt1);
      } catch (secondError) {
        console.error('Failed to load from alternative path 1, trying alternative path 2:', secondError);

        try {
          await this.mainWindow.loadFile(indexPathAlt2);
          
        } catch (thirdError) {
          console.error('Failed to load from all paths:', thirdError);
          this.mainWindow.webContents.loadURL(`data:text/html;charset=utf-8,
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
  }
}

// Non esportiamo più un'istanza singleton, verrà gestita da TypeDI
