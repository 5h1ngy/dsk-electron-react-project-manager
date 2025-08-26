import { Sequelize } from 'sequelize';
import path from 'path';
import { app } from 'electron';

/**
 * Database configuration class
 */
export class DatabaseConfig {
  private static instance: DatabaseConfig;
  private _sequelize: Sequelize | null = null;
  private _dbPath: string = '';

  private constructor() {
    // Private constructor for singleton pattern
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): DatabaseConfig {
    if (!DatabaseConfig.instance) {
      DatabaseConfig.instance = new DatabaseConfig();
    }
    return DatabaseConfig.instance;
  }

  /**
   * Initialize database configuration
   */
  public async initialize(): Promise<void> {
    // Wait for app to be ready before accessing paths
    if (!app.isReady()) {
      await new Promise<void>((resolve) => app.on('ready', () => resolve()));
    }
    
    // Now that app is ready, get the paths
    this._dbPath = path.join(app.getPath('userData'), 'database.sqlite');
  }

  /**
   * Get database path
   */
  public get dbPath(): string {
    return this._dbPath;
  }

  /**
   * Create and configure Sequelize instance
   */
  public createSequelizeInstance(): Sequelize {
    if (!this._sequelize) {
      this._sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: this._dbPath,
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
      });
    }
    return this._sequelize;
  }

  /**
   * Get current Sequelize instance
   */
  public get sequelize(): Sequelize | null {
    return this._sequelize;
  }
}

export default DatabaseConfig.getInstance();
