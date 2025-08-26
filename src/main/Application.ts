import { app, BrowserWindow } from 'electron';
import { join } from 'path';
import { Service } from 'typedi';

// Importiamo il logger singleton direttamente
import { logger } from './shared/logger';

// Importazione dei servizi tramite TypeDI
import { ControllerRegistry } from './controllers';
import { DatabaseService } from './services/database.service';

/**
 * Classe principale dell'applicazione
 * Responsabile per l'inizializzazione e la gestione del ciclo di vita dell'app
 */
@Service()
export class Application {
  private mainWindow: BrowserWindow | null = null;

  private databaseService: DatabaseService;

  constructor(
    // Utilizziamo l'iniezione delle dipendenze solo per il registro dei controller
    private controllerRegistry: ControllerRegistry
  ) {
    // Usiamo direttamente il logger singleton
    logger.info('Application class instantiated - direct logger usage');
    
    // Otteniamo l'istanza singleton del DatabaseService
    this.databaseService = DatabaseService.getInstance();
  }
  
  /**
   * Inizializza l'applicazione
   */
  public async init(): Promise<void> {
    try {
      // Configurazione di base per Windows
      this.configureForWindows();
      
      // Registra gli eventi di app
      this.registerAppEvents();
      
      // Inizializza il database
      await this.databaseService.initialize();
      
      // Inizializza i controller
      this.controllerRegistry.registerAllHandlers();
      
      logger.info('Application initialized successfully');
    } catch (error) {
      logger.error(`Error initializing application: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Configura l'applicazione per Windows
   */
  private configureForWindows(): void {
    if (process.platform === 'win32') {
      // Disabilita accelerazione hardware per Windows 7
      app.disableHardwareAcceleration();
      
      // Imposta application name per notifiche Windows 10+
      app.setAppUserModelId(app.getName());
    }
  }

  /**
   * Registra eventi del ciclo di vita dell'app
   */
  private registerAppEvents(): void {
    // Evento ready
    app.whenReady().then(() => {
      this.createWindow();

      app.on('will-quit', async () => {
        logger.info('App will quit');
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
      logger.info('All windows closed, quitting app');
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });
  }

  /**
   * Crea la finestra principale
   */
  private async createWindow(): Promise<void> {
    logger.info('Creating main window...');
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
    
    logger.info('Main window created successfully');

    // Imposta Content Security Policy
    this.configureContentSecurityPolicy();

    try {
      // Inizializza database
      logger.info('Initializing database...');
      await this.databaseService.initialize();
      logger.info('Database initialized successfully');

      // Registra tutti gli handler IPC
      logger.info('Registering IPC handlers...');
      this.controllerRegistry.registerAllHandlers();
      logger.info('IPC handlers registered successfully');
    } catch (error: any) {
      logger.error(`Failed to initialize application: ${error?.message || 'Unknown error'}`);
      console.error('Failed to initialize application:', error);
    }

    // Carica l'interfaccia utente
    await this.loadUserInterface();

    // In development mode, apre DevTools
    if (process.env.NODE_ENV === 'development') {
      this.mainWindow.webContents.openDevTools();
    }
  }

  /**
   * Configura la Content Security Policy
   */
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

  /**
   * Carica l'interfaccia utente
   */
  private async loadUserInterface(): Promise<void> {
    logger.info('Loading user interface...');
    if (!this.mainWindow) {
      logger.error('Cannot load user interface: main window is not created');
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
      // First try the relative path from __dirname
      await this.mainWindow.loadFile(indexPath);
    } catch (error) {
      console.error('Failed to load from primary path, trying alternative path 1:', error);
      try {
        // If that fails, try the absolute path from current working directory
        await this.mainWindow.loadFile(indexPathAlt1);
      } catch (secondError) {
        console.error('Failed to load from alternative path 1, trying alternative path 2:', secondError);
        try {
          // Last attempt with a different relative path
          await this.mainWindow.loadFile(indexPathAlt2);
        } catch (thirdError) {
          console.error('Failed to load from all paths:', thirdError);
          // As a last resort, display an error
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
